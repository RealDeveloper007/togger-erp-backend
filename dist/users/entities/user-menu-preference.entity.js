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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMenuPreference = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../common/entities/base.entity");
const user_entity_1 = require("./user.entity");
let UserMenuPreference = class UserMenuPreference extends base_entity_1.BaseEntity {
};
exports.UserMenuPreference = UserMenuPreference;
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], UserMenuPreference.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], UserMenuPreference.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sidebar_collapsed', default: false }),
    __metadata("design:type", Boolean)
], UserMenuPreference.prototype, "sidebarCollapsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hidden_menu_ids', type: 'jsonb', default: [] }),
    __metadata("design:type", Array)
], UserMenuPreference.prototype, "hiddenMenuIds", void 0);
exports.UserMenuPreference = UserMenuPreference = __decorate([
    (0, typeorm_1.Entity)('user_menu_preferences'),
    (0, typeorm_1.Unique)(['userId'])
], UserMenuPreference);
//# sourceMappingURL=user-menu-preference.entity.js.map