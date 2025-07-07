import { Gym, Prisma } from '@prisma/client'

export interface GymsRepository {
  findyById(id: string): Promise<Gym | null>
  create(data: Prisma.GymCreateInput): Promise<Gym>
}
