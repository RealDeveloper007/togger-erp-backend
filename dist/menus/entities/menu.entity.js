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
exports.Menu = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../common/entities/base.entity");
const role_entity_1 = require("../../roles/entities/role.entity");
let Menu = class Menu extends base_entity_1.BaseEntity {
};
exports.Menu = Menu;
__decorate([
    (0, typeorm_1.Column)({ name: 'menu_key', unique: true, length: 100 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Menu.prototype, "menuKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 150 }),
    __metadata("design:type", String)
], Menu.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 100 }),
    __metadata("design:type", String)
], Menu.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 255 }),
    __metadata("design:type", String)
], Menu.prototype, "route", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sort_order', default: 0 }),
    __metadata("design:type", Number)
], Menu.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Menu.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_visible', default: true }),
    __metadata("design:type", Boolean)
], Menu.prototype, "isVisible", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_collapsible', default: false }),
    __metadata("design:type", Boolean)
], Menu.prototype, "isCollapsible", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'badge_text', nullable: true, length: 50 }),
    __metadata("design:type", String)
], Menu.prototype, "badgeText", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'badge_color', nullable: true, length: 50 }),
    __metadata("design:type", String)
], Menu.prototype, "badgeColor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parent_id', nullable: true }),
    __metadata("design:type", String)
], Menu.prototype, "parentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Menu, (menu) => menu.children, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'parent_id' }),
    __metadata("design:type", Menu)
], Menu.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Menu, (menu) => menu.parent),
    __metadata("design:type", Array)
], Menu.prototype, "children", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => role_entity_1.Role, (role) => role.menus),
    __metadata("design:type", Array)
], Menu.prototype, "roles", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'required_permission', nullable: true, length: 100 }),
    __metadata("design:type", String)
], Menu.prototype, "requiredPermission", void 0);
exports.Menu = Menu = __decorate([
    (0, typeorm_1.Entity)('menus')
], Menu);
//# sourceMappingURL=menu.entity.js.map