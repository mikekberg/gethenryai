import axios, { AxiosInstance } from 'axios';
import { BlockBlobClient } from '@azure/storage-blob';
class HenryAiApi {
    private api: AxiosInstance;
    public hasAuthToken = false;

    constructor(public baseUrl: string) {
        this.api = axios.create({
            baseURL: baseUrl
        });
    }

    public setAuthToken(token: string) {
        this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        this.hasAuthToken = true;
    }

    public async ping() {
        return await this.api.get('/ping');
    }

    public async getGoogleCalendarEvents() {
        return (await this.api.get('/gcal/events')).data;
    }

    public async getMyMeetings() {
        return (await this.api.get('/meetings')).data;
    }

    public async generateUploadUrl() {
        return (await this.api.get('/meetings/generate-upload-url')).data as {
            meetingId: string;
            uploadUrl: string;
        };
    }

    public async uploadAudioFile(uploadUrl: string, file: File) {
        await new BlockBlobClient(uploadUrl).uploadData(file);
    }

    public async createMeeting(fileData: File) {
        const formData = new FormData();
        formData.append('audioFile', fileData, fileData.name);

        console.log(fileData);
        const url = URL.createObjectURL(fileData);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileData.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return await this.api.post('/meetings/create', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
}

export default new HenryAiApi(process.env.VUE_APP_HENRYAPI_BASEURL);
