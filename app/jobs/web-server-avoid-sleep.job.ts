import ip from 'ip';
import http from 'http';
import { appEnvironment } from '../app.environment';

class WebServerAvoidSleepingJob {
  private timeout = 4 * 60 * 1000;
  public runJob(): void {
    if (!appEnvironment.prod) {
      return;
    }

    const url = `http://${ip.address()}:${appEnvironment.port}`;
    console.log('runnig avoid sleeping job for ', url);
    setInterval(() => http.get(url), this.timeout);
  }
}

export const webServerAvoidSleeping = new WebServerAvoidSleepingJob();