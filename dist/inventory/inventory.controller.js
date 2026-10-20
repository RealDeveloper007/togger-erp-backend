"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const inventory_service_1 = require("./inventory.service");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const user_entity_1 = require("../users/entities/user.entity");
let InventoryController = class InventoryController {
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    getBalances(query) {
        return this.inventoryService.getAllBalances(query);
    }
    getMovements(query) {
        return this.inventoryService.getMovements(query);
    }
    getLowStock() {
        return this.inventoryService.getLowStockProducts();
    }
    getLocations() {
        return this.inventoryService.getLocations();
    }
    receiveStock(dto, user) {
        return this.inventoryService.receiveStock(dto, user.id);
    }
    adjustStock(dto, user) {
        return this.inventoryService.adjustStock(dto, user.id);
    }
    reserveStock(dto, user) {
        return this.inventoryService.reserveStock(dto, user.id);
    }
    releaseReservation(dto, user) {
        return this.inventoryService.releaseReservation(dto, user.id);
    }
    consumeStock(dto, user) {
        return this.inventoryService.consumeStock(dto, user.id);
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Get)('balances'),
    (0, permissions_decorator_1.RequirePermissions)('inventory.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all stock balances' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getBalances", null);
__decorate([
    (0, common_1.Get)('movements'),
    (0, permissions_decorator_1.RequirePermissions)('inventory.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get stock movements log' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getMovements", null);
__decorate([
    (0, common_1.Get)('low-stock'),
    (0, permissions_decorator_1.RequirePermissions)('inventory.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get low stock products' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getLowStock", null);
__decorate([
    (0, common_1.Get)('locations'),
    (0, permissions_decorator_1.RequirePermissions)('inventory.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get stock locations' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getLocations", null);
__decorate([
    (0, common_1.Post)('receive'),
    (0, permissions_decorator_1.RequirePermissions)('inventory.receive'),
    (0, swagger_1.ApiOperation)({ summary: 'Receive stock' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_service_1.ReceiveStockDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "receiveStock", null);
__decorate([
    (0, common_1.Post)('adjust'),
    (0, permissions_decorator_1.RequirePermissions)('inventory.adjust'),
    (0, swagger_1.ApiOperation)({ summary: 'Adjust stock quantity' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_service_1.AdjustStockDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "adjustStock", null);
__decorate([
    (0, common_1.Post)('reserve'),
    (0, permissions_decorator_1.RequirePermissions)('inventory.adjust'),
    (0, swagger_1.ApiOperation)({ summary: 'Reserve stock for a job/quotation' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_service_1.ReserveStockDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "reserveStock", null);
__decorate([
    (0, common_1.Post)('release'),
    (0, permissions_decorator_1.RequirePermissions)('inventory.adjust'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_service_1.ReserveStockDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "releaseReservation", null);
__decorate([
    (0, common_1.Post)('consume'),
    (0, permissions_decorator_1.RequirePermissions)('inventory.adjust'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_service_1.ReserveStockDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "consumeStock", null);
exports.InventoryController = InventoryController = __decorate([
    (0, swagger_1.ApiTags)('inventory'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('inventory'),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map