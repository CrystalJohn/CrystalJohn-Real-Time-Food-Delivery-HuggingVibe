import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Driver, DriverDocument } from '../driver.schema';

@Injectable()
export class DriverRepository {
  constructor(@InjectModel(Driver.name) private readonly driverModel: Model<DriverDocument>) {}

  async create(
    userId: string,
    vehicleType: string,
    licensePlate: string,
    phone: string,
  ): Promise<Driver> {
    return this.driverModel.create({
      userId,
      vehicleType,
      licensePlate,
      phone,
      status: 'PENDING',
    });
  }

  async findAll(status?: string): Promise<Driver[]> {
    const filter: Record<string, unknown> = {};
    if (status) {
      filter.status = status;
    }

    return this.driverModel.find(filter).exec();
  }

  async findById(id: string): Promise<Driver | null> {
    return this.driverModel.findById(id).exec();
  }

  async updateById(id: string, update: Record<string, unknown>): Promise<Driver | null> {
    return this.driverModel.findByIdAndUpdate(id, update, { new: true }).exec();
  }
}
