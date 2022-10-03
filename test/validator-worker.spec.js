import { validatorWorker } from "../src/modules/validator-worker";
import {jest} from '@jest/globals'


describe("validatorWorker", () => {

  it('should listening on message event', async () => {
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    setTimeoutSpy.mockImplementation((fn) => fn());
  });

  it('should userAccount on message event', async () => {
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    setTimeoutSpy.mockImplementation((fn) => fn());
  });

  it('should txnGatewayEndpoints on message event', async () => {
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    setTimeoutSpy.mockImplementation((fn) => fn());
  });


  it('should walletService on message event', async () => {
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    setTimeoutSpy.mockImplementation((fn) => fn());
  })

});


