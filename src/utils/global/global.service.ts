import { Injectable } from '@nestjs/common';

@Injectable()
export class GlobalService {
    static EMAIL_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
}
