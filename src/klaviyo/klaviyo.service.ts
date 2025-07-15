import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateEventDto } from '../events/dto/create-event.dto';

@Injectable()
export class KlaviyoService {
  private readonly logger = new Logger(KlaviyoService.name);
  private readonly baseUrl = 'https://a.klaviyo.com/api';
  private readonly revision = '2023-10-15';
  private readonly apiKey: string;

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
  ) {
    this.apiKey = config.get<string>('KLAVIYO_API_KEY', '');
  }

  // private authHeader() {
  //   return { Authorization: `Klaviyo-API-Key ${this.apiKey}` };
  // }

  private authHeader(jsonApi = false) {
    const headers: Record<string, string> = {
      Authorization: `Klaviyo-API-Key ${this.apiKey}`,
      revision: this.revision,
    };
    if (jsonApi) {
      headers['Content-Type'] = 'application/vnd.api+json';
      headers['accept']       = 'application/vnd.api+json';
    }
    return headers;
  }

  async sendEvent(dto: CreateEventDto) {
    try {
      const payload = {
        data: {
          type: 'event',
          attributes: {
            metric: { name: dto.eventName },
            properties: dto.eventAttributes ?? {},
            profile: dto.profileAttributes ?? {},
            time: Math.floor(Date.now() / 1000),
          },
        },
      };

      await firstValueFrom(
        this.http.post(`${this.baseUrl}/events/`, payload, {
          headers: {
            ...this.authHeader(),
            revision: this.revision,
            'Content-Type': 'application/json',
          },
        }),
      );
    } catch (error) {
      this.logger.error(
        'Failed to send event to Klaviyo',
        error?.message || error,
      );
    }
  }

  async sendBulk(events: CreateEventDto[]) {
    for (const event of events) {
      await this.sendEvent(event);
    }
  }

  async getMetrics() {
    const response = await firstValueFrom(
      this.http.get(`${this.baseUrl}/metrics/`, {
        headers: { ...this.authHeader(), revision: this.revision },
      }),
    );
    return response.data;
  }

  
  async getProfileAttributesByEmail(email: string) {
    const profile = await this.getProfileResourceByEmail(email);
    return profile ? profile.attributes : null;
  }

  async getProfileResourceByEmail(email: string): Promise<{ id: string; attributes: any } | null> {
    const response = await firstValueFrom(
      this.http.get<{ data: Array<any> }>(`${this.baseUrl}/profiles/`, {
        headers: { ...this.authHeader(), revision: this.revision },
        params: { filter: `equals(email,"${email}")` },
      }),
    );
    const data = response.data.data;
    return Array.isArray(data) && data.length ? data[0] : null;
  }

  async getMetricsForProfileEmail(email: string) {
    // 1) find the profile
    const profile = await this.getProfileResourceByEmail(email);
    if (!profile) return [];

    const profileId = profile.id;
    console.log('Fetching events for profile_id=', profileId);

    // 2) fetch events including metric relationship
    const res = await firstValueFrom(
      this.http.get<any>(`${this.baseUrl}/events/`, {
        headers: {
          ...this.authHeader(),
          revision: this.revision,
          accept: 'application/vnd.api+json',
        },
        params: {
          filter: `equals(profile_id,"${profileId}")`,
          include: 'metric',
          'page[size]': 200,
        },
      }),
    );

    // 3) collect all included metrics
    const included = res.data.included as Array<any>;
    const metrics = (included || [])
      .filter((inc) => inc.type === 'metric')
      .map((m) => ({
        id: m.id,
        ...(m.attributes || {}),
      }));

    // 4) dedupe by id
    const unique = Array.from(
      metrics.reduce((map, m) => map.set(m.id, m), new Map<string, any>()).values()
    );

    return unique;
  }

  private async getEventsCountForMetric(metricId: string, date: string): Promise<number> {
  const start = `${date}T00:00:00Z`;
  const end   = `${date}T24:00:00Z`;
  const payload = {
    data: {
      type: 'metric-aggregate',
      attributes: {
        metric_id:    metricId,
        measurements: ['count'],
        filter: [
          `greater-or-equal(datetime,${start})`,
          `less-than(datetime,${end})`
        ],
        interval:  'day',
        page_size: 500,
        timezone:  'UTC'
      }
    }
  };

  const resp = await firstValueFrom(
    this.http.post(
      `${this.baseUrl}/metric-aggregates/`,
      payload,
      { headers: { ...this.authHeader(), 'Content-Type': 'application/json' } }
    )
  );

  // resp.data.data.attributes.values is an array of { timestamp, count }
  const values: Array<{ count: number }> = resp.data?.data?.attributes?.values ?? [];
  return values.reduce((sum, v) => sum + (v.count || 0), 0);
}

  /**
   * 4) Count of events for *every* metric on a given date
   */
  async getEventsCountByDate(date: string): Promise<{
    date: string;
    results: Array<{ id: string; name: string; count: number }>;
  }> {
    if (!date) throw new BadRequestException('date is required (YYYY‑MM‑DD)');

    // 1) fetch all metrics
    const all = await this.getMetrics();
    const list: Array<{ id: string; attributes: { name: string } }> = all.data;

    // 2) for each metric call the aggregate endpoint with rate limiting
    const results: Array<{ id: string; name: string; count: number }> = [];
    for (const m of list) {
      try {
        // Add delay between requests to avoid rate limiting
        if (results.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
        }
        
        const count = await this.getEventsCountForMetric(m.id, date);
        results.push({
          id: m.id,
          name: m.attributes.name,
          count,
        });
      } catch (error) {
        this.logger.warn(`Failed to get count for metric ${m.attributes.name}: ${error.message}`);
        results.push({
          id: m.id,
          name: m.attributes.name,
          count: 0,
        });
      }
    }

    return { date, results };
  }


  async getEmailsByMetricName(
    metricName: string,
    date: string
  ): Promise<{ metric: string; date: string; emails: string[] }> {
    if (!date) throw new BadRequestException('date is required (YYYY-MM-DD)');
    if (!metricName) throw new BadRequestException('metric name is required');
  
    // 1) Lookup metric ID
    const metricsRes = await firstValueFrom(
      this.http.get<{ data: any[] }>(
        `${this.baseUrl}/metrics/`,
        { headers: this.authHeader() }
      )
    );
    const metric = metricsRes.data.data.find(
      m => m.attributes.name.toLowerCase() === metricName.toLowerCase()
    );
    if (!metric) throw new NotFoundException(`Metric "${metricName}" not found`);
    const metricId = metric.id;
  
    // 2) Paginate through all events
    let nextUrl: string | null = `${this.baseUrl}/events/`;
    const params = {
      filter:       `equals(metric_id,"${metricId}")`,
      include:      'profile',
      sort: '-timestamp',
      'page[size]': 200,
    };
  
    const allEvents: any[] = [];
    const allProfiles: any[] = [];
  
    while (nextUrl) {
      const resp = await firstValueFrom(
        this.http.get<any>(nextUrl, {
          headers: { ...this.authHeader(), accept: 'application/vnd.api+json' },
          params: nextUrl === `${this.baseUrl}/events/` ? params : undefined,
        })
      );
  
      allEvents.push(...(resp.data.data || []));
      allProfiles.push(...(resp.data.included || []));
  
      // advance to the next page
      nextUrl = resp.data.links?.next || null;
    }
  
    // 3) Map profile IDs → emails
    const emailByProfile: Record<string,string> = {};
    for (const inc of allProfiles) {
      if (inc.type === 'profile' && inc.id && inc.attributes?.email) {
        emailByProfile[inc.id] = inc.attributes.email;
      }
    }
  
    // 4) Filter events by date and pluck emails
    const windowStart = `${date}T00:00:00`;
    const windowEnd   = `${date}T23:59:59`;
    const emails = allEvents
      .map(evt => {
        const ts = evt.attributes.datetime.replace(' ', 'T').split('+')[0];
        if (ts >= windowStart && ts <= windowEnd) {
          const pid = evt.relationships.profile?.data?.id;
          return emailByProfile[pid];
        }
      })
      .filter((e): e is string => Boolean(e));
  
    // 5) Dedupe
    const unique = Array.from(new Set(emails));
  
    return { metric: metricName, date, emails: unique };
  }
}
