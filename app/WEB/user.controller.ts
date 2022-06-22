import { UserRepository } from '../DAL/User/user.repository';
import { Request, Response } from 'express';


export class UserController {
    private readonly userRepository = new UserRepository();

    constructor() {
    }

    public async getAllUsers(req: Request, res: Response): Promise<void> {
        const users = await this.userRepository.getAllUsers();
        res.json({users, total: users.length});
    }
}