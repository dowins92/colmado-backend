
import { validate } from 'class-validator';
import { CreateCategoryDto } from './src/products/dto/create-category.dto';
import { plainToInstance } from 'class-transformer';

async function test() {
    console.log('Testing CreateCategoryDto with description: null');

    // Simulate the incoming object (after body parsing, before ValidationPipe transformation)
    // plainToInstance is what ValidationPipe (transform: true) does to convert plain object to DTO instance
    const plainObj = {
        name: 'Refrescos 1L',
        description: null
    };

    const dto = plainToInstance(CreateCategoryDto, plainObj);

    // Validate
    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });

    if (errors.length > 0) {
        console.log('Validation failed:', JSON.stringify(errors, null, 2));
    } else {
        console.log('Validation passed!');
    }
}

test();
