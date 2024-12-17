import { useQuery } from "@tanstack/vue-query";
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
}

export default new HenryAiApi(process.env.VUE_APP_HENRYAPI_BASEURL);
