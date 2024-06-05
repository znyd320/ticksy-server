import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ErrorExceptionFilter } from './common/filters/error-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('RIKOUL')
    .setDescription('RIKOUL API description')
    .setVersion('1.0')
    .addTag('RIKOUL')
    .addBearerAuth()
    .build();
  app.setGlobalPrefix('api/v1');
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    // swaggerOptions: {
    //   tagsSorter: 'alpha',
    //   operationsSorter: 'alpha',
    // },
  });

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
  app.enableCors();
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     transform: true,
  //   }),
  // );
  app.useGlobalInterceptors(new ResponseInterceptor());
  // app.useGlobalFilters(new ErrorExceptionFilter());

  await app.listen(3000);
}
bootstrap();
