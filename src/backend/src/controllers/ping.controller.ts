import { JsonController, Get } from 'routing-controllers';
import { Service } from 'typedi';

// Used to check the health of the API
@Service()
@JsonController()
export class PingController {
    @Get('/ping')
    public ping() {
        return { result: true };
    }
}
