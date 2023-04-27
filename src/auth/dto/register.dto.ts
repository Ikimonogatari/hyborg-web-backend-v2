import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {

    @ApiProperty()
    email: string;

    @ApiProperty()
    password: string;

    @ApiProperty({
        description: "Should match with password"
    })
    password2: string;
}