import { AuthRepository } from './auth.repository';
import { RegisterDto, LoginDto } from './auth.dto';
import { hashPassword, comparePassword } from '@shared/utils/password';
import { generateToken } from '@shared/utils/jwt';

export class AuthService {
  private repository = new AuthRepository();

  async register(dto: RegisterDto) {
    const existing = await this.repository.findUserByEmail(dto.email);
    if (existing) {
      throw new Error('User already exists');
    }

    const hashedPassword = await hashPassword(dto.password);
    
    const { user } = await this.repository.initializeUser({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      bvn: dto.bvn, // Ideally encypted, simplified for hackathon or handled pre-db
      nin: dto.nin,
    });

    const token = generateToken({ id: user.id, email: user.email });
    return { user: { id: user.id, email: user.email }, token };
  }

  async login(dto: LoginDto) {
    const user = await this.repository.findUserByEmail(dto.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await comparePassword(dto.password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken({ id: user.id, email: user.email });
    return { user: { id: user.id, email: user.email }, token };
  }
}
