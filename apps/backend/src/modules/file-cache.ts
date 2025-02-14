import { Cache } from "file-system-cache";

export class FileCache {
  public static MINUTE = 60;
  public static HOUR = 60 * 60;
  public static DAY = 60 * 60 * 24;
  public static WEEK = FileCache.DAY * 7;
  public static MONTH = FileCache.DAY * 30;
  public static YEAR = FileCache.DAY * 365;

  public static client = new Cache({
    basePath: "../.cache", // (optional) Path where cache files are stored (default).
    ns: "iga", // (optional) A grouping namespace for items.
    hash: "sha1", // (optional) A hashing algorithm used within the cache key.
    ttl: this.YEAR,
  });

  public static async remember(
    key: string,
    time: number = -1,
    func: () => Promise<any>,
    loadInBAckground: boolean = false
  ) {
    const cachedValue = await this.client.get(key);

    if (cachedValue) {
      const cachedData = JSON.parse(cachedValue);
      if (
        time > 0 &&
        cachedData.time + cachedData.expTime * 1000 > Date.now()
      ) {
        return cachedData.data;
      } else if (loadInBAckground) {
        this.remember(key, time, func, false)
          .then((result) => {})
          .catch((err) => {});
        return cachedData.data;
      }
    }

    const result = await func();

    const cacheData = {
      data: result,
      time: Date.now(),
      expTime: time,
    };

    const options = {};

    if (time > 0) {
      options["ex"] = time;
    }

    this.client.set(key, JSON.stringify(cacheData), time);

    return result;
  }

  public static async forget(key: string) {
    await this.client.remove(key);
  }
}
