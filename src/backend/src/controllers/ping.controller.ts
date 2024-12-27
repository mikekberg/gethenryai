import { JsonController, Get } from 'routing-controllers';

@JsonController()
export class PingController {
    @Get('/ping')
    public ping() {
        return { result: true };
    }
}
