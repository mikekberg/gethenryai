import { JsonController, Get } from 'routing-controllers';

// Used to check the health of the API
@JsonController()
export class PingController {
    @Get('/ping')
    public ping() {
        return { result: true };
    }
}
