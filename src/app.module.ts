import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { StockModule } from './stock/stock.module';
import { SalesModule } from './sales/sales.module';
import { FinanceModule } from './finance/finance.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { PointOfSaleModule } from './point-of-sale/point-of-sale.module';
import { CustomersModule } from './customers/customers.module';
import { DebtsModule } from './debts/debts.module';
import { UsersModule } from './users/users.module';
import { CurrenciesModule } from './currencies/currencies.module';
import { BusinessModule } from './business/business.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { BusinessGuard } from './auth/business.guard';

@Module({
  imports: [PrismaModule, AuthModule, ProductsModule, StockModule, SalesModule, FinanceModule, WarehousesModule, PointOfSaleModule, CustomersModule, DebtsModule, UsersModule, CurrenciesModule, BusinessModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: BusinessGuard,
    },
  ],
})
export class AppModule { }
