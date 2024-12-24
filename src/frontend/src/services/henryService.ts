import axios, { AxiosInstance } from "axios";
class HenryAiApi {
  private api: AxiosInstance;

  constructor(public baseUrl: string) {
    this.api = axios.create({
      baseURL: baseUrl,
    });
  }

  public setAuthToken(token: string) {
    this.api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  public async ping() {
    return await this.api.get("/ping");
  }

  public async getGoogleCalendarEvents() {
    console.log(`calling: ${this.baseUrl}/gcal/events`);
    return await this.api.get("/gcal/events");
  }
}

export default new HenryAiApi(process.env.VUE_APP_HENRYAPI_BASEURL);
