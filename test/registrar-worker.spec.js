import { registrarWorker } from "../src/modules/registrar-worker";
import {jest} from '@jest/globals'

describe("Registrar Worker", () => {
  it("should listening on message event", () => {
    const NOW = '2019-05-03T08:00:00.000Z';
    const spy = jest.spyOn(self, 'addEventListener').mockImplementationOnce((event, handler, options) => {
      return new Date(NOW).getTime();
    });
    registrarWorker('ssssss', 'ssss');
    expect(self.addEventListener).toBeCalledWith('message', expect.any(Function), false);
    registrarWorker();
    expect(spy).toHaveBeenCalledTimes(1);
    // expect(self.addEventListener).toBeCalledWith('message', expect.any(Function), false);
  });
});
