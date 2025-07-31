
import { IsNotEmpty, IsString } from "class-validator";

export class AddressDto {
    @IsString()
    @IsNotEmpty()
    line1: string;
    
    @IsString()
    @IsNotEmpty()
    line2?: string;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    state: string;

    @IsString()
    @IsNotEmpty()
    postalCode: string;

    @IsString() 
    @IsNotEmpty()
    country: string;
}
