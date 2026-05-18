import prisma from "../config/prisma.config";

interface CreateUserData {
  email: string;
  name?: string;
  password: string;
}

class UserRepository {
  async createUser(data: CreateUserData) {
    return await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.password,
      },
    });
  }

  async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }
}

export default UserRepository;