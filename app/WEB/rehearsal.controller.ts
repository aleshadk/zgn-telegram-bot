import { UserRepository } from '../DAL/User/user.repository';
import { Request, Response } from 'express';
import { RehearsalRepository } from '../DAL/Rehearsal/rehearsal.repository';


export class RehearsalController {
    private readonly rehearsalRepository = new RehearsalRepository();

    public async getAllRehearsals(req: Request, res: Response): Promise<void> {
        const rehearsals = await this.rehearsalRepository.getAllRehearsals();
        res.json({rehearsals, total: rehearsals.length});
    }
}