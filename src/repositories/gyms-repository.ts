import { Gym } from '@prisma/client'

export interface GymsRepository {
  findyById(id: string): Promise<Gym | null>
}
