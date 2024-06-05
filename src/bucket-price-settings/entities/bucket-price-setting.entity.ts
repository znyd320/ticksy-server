import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

class PriceList {
  actualPrice: number;
  sellPrice: number;
}

@Schema({ timestamps: true, versionKey: false })
export class BucketPriceSetting extends Document {
  @Prop({
    type: Types.ObjectId,
    ref: 'BucketCategory',
    required: true,
  })
  categoryId: Types.ObjectId;

  @Prop({ type: [PriceList], required: true })
  priceList: PriceList[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const BucketPriceSettingSchema =
  SchemaFactory.createForClass(BucketPriceSetting);

// Unique Validation of this schema
// BucketPriceSettingSchema.post('save', function (error : any, doc : any, next : any) {
//     if (error.name === 'MongoServerError' && error.code === 11000) {
//         next(new Error('BucketPriceSetting already exists'));
//     } else {
//         next(error);
//     }
// });
