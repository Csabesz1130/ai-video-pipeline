declare module 'google-trends-api' {
  interface Options {
    keyword: string | string[];
    startTime?: Date;
    endTime?: Date;
    geo?: string;
    resolution?: string;
    category?: number;
  }

  interface InterestOptions extends Options {
    granularTimeResolution?: boolean;
  }

  export function interestOverTime(options: InterestOptions): Promise<string>;
  export function interestByRegion(options: Options): Promise<string>;
  export function relatedQueries(options: Options): Promise<string>;
  export function relatedTopics(options: Options): Promise<string>;
  export function realTimeTrends(options: Options): Promise<string>;
  export function dailyTrends(options: Options): Promise<string>;

  const googleTrends: {
    interestOverTime: typeof interestOverTime;
    interestByRegion: typeof interestByRegion;
    relatedQueries: typeof relatedQueries;
    relatedTopics: typeof relatedTopics;
    realTimeTrends: typeof realTimeTrends;
    dailyTrends: typeof dailyTrends;
  };

  export default googleTrends;
}