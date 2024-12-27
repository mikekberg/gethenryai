import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import azureFunctionHandler from 'azure-aws-serverless-express';
import { createApp } from '../src/app';

const app = createApp();
const httpTrigger: AzureFunction = function (
    context: Context,
    req: HttpRequest
) {
    return azureFunctionHandler(app)(context, req);
};

export default httpTrigger;
