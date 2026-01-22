import {IsEmail, IsNotEmpty, IsString, Matches, MinLength, IsOptional, IsPhoneNumber} from "class-validator";


export class RegisterDto {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsNotEmpty()
    @IsString()
    fullName: string;

    @IsOptional()
    @IsPhoneNumber('VN')
    phoneNumber?: string;

    @IsOptional()
    @IsString()
    address?: string;
}



export class LoginDto {
    @IsNotEmpty({ message: 'Username or Email is required' })
    @IsString()
    username: string;

    @IsNotEmpty({ message: 'Password is required' })
    @IsString()
    password: string;
}


export class RefreshTokenDto {
    @IsNotEmpty({ message: 'Refresh token is required' })
    @IsString()
    refreshToken: string;
}


export class ChangePasswordDto {
    @IsNotEmpty({ message: 'Old password is required' })
    @IsString()
    oldPassword: string;

    @IsNotEmpty({ message: 'New password cannot be blank' })
    @MinLength(6, { message: 'New password must be at least 6 characters' })
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Password must contain uppercase letters, lowercase letters, and numbers/special characters',
    })
    newPassword: string;
}


export class ForgotPasswordDto {
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Email is not in correct format' })
    email: string;
}


export class ResetPasswordDto {
    @IsNotEmpty({ message: 'Reset token/OTP is required' })
    @IsString()
    token: string;

    @IsNotEmpty({ message: 'New password cannot be blank' })
    @MinLength(6, { message: 'New password must be at least 6 characters' })
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Password must contain uppercase letters, lowercase letters, and numbers/special characters',
    })
    newPassword: string;
}