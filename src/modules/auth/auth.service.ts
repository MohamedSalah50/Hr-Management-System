import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { signupDto } from './dto/signup.dto';
import { type UserDocument, UserRepository } from 'src/db';
import { compareHash } from 'src/utils';
import { LoginDto } from './dto/login.dto';
import { TokenService } from 'src/utils/security/token.security';
import { IAuthRequest, LoginCredentialsResponse } from 'src/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async signup(dto: signupDto): Promise<{ message: string }> {
    const { fullName, userName, email, password } = dto;

    const existingUser = await this.userRepository.findOne({
      filter: { email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const [user] =
      (await this.userRepository.create({
        data: [
          {
            fullName,
            userName,
            email,
            password,
          },
        ],
      })) || [];

    if (!user)
      throw new BadRequestException(
        'fail to signup this user, please try again later',
      );

    // await this.createConfirmEmailOtp(user._id);

    return {
      message: 'signup successfull',
    };
  }

  async login(dto: LoginDto): Promise<LoginCredentialsResponse> {
    const { password, usernameOrEmail } = dto;

    const user = await this.userRepository.findOne({
      filter: {
        $or: [{ email: usernameOrEmail }, { userName: usernameOrEmail }],
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'من فضلك ادخل اسم مستخدم صالح او بريد الكتروني صالح',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException('الحساب غير نشط');
    }

    if (!(await compareHash(password, user.password))) {
      throw new UnauthorizedException('من فضلك ادخل كلمة مرور صالحة');
    }

    return await this.tokenService.createLoginCredentials(user as UserDocument);
  }

  async refreshToken(req: IAuthRequest) {
    const credentials = await this.tokenService.createLoginCredentials(
      req.user,
    );
    await this.tokenService.revokeToken(req.decoded);
    return credentials;
  }

  async logout(req: IAuthRequest): Promise<{ message: string }> {
    await this.tokenService.revokeToken(req.decoded);
    return {
      message: 'تم تسجيل الخروج بنجاح',
    };
  }

  async getCurrentUser(userId: string) {
    const user = await this.userRepository.findOne({ filter: { _id: userId } });

    if (!user) {
      throw new UnauthorizedException('المستخدم غير موجود');
    }

    // Populate role with permissions
    const userWithRole = await this.userRepository.findOne({
      filter: {
        _id: userId,
      },
      options: {
        populate: [
          {
            path: 'roleId',
            select: 'name permissions',
          },
        ],
      },
    });

    if (!userWithRole) {
      throw new UnauthorizedException('المستخدم بهذه الصلاحيه غير موجود');
    }

    return {
      id: user._id,
      fullName: user.fullName,
      username: user.userName,
      email: user.email,
      role: userWithRole[0]?.roleId || null,
      isActive: user.isActive,
    };
  }
}
