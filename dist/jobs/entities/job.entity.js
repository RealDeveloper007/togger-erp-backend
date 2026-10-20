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
exports.JobLabourRecord = exports.JobMaterialUsage = exports.Job = exports.JobStatus = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../common/entities/base.entity");
const quotation_entity_1 = require("../../quotations/entities/quotation.entity");
const customer_entity_1 = require("../../customers/entities/customer.entity");
const customer_address_entity_1 = require("../../customers/entities/customer-address.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const product_entity_1 = require("../../products/entities/product.entity");
var JobStatus;
(function (JobStatus) {
    JobStatus["PENDING"] = "pending";
    JobStatus["SCHEDULED"] = "scheduled";
    JobStatus["IN_PROGRESS"] = "in_progress";
    JobStatus["ON_HOLD"] = "on_hold";
    JobStatus["COMPLETED"] = "completed";
    JobStatus["CANCELLED"] = "cancelled";
})(JobStatus || (exports.JobStatus = JobStatus = {}));
let Job = class Job extends base_entity_1.BaseEntity {
};
exports.Job = Job;
__decorate([
    (0, typeorm_1.Column)({ name: 'job_number', unique: true, length: 50 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Job.prototype, "jobNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quotation_id', nullable: true }),
    __metadata("design:type", String)
], Job.prototype, "quotationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => quotation_entity_1.Quotation, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'quotation_id' }),
    __metadata("design:type", quotation_entity_1.Quotation)
], Job.prototype, "quotation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id' }),
    __metadata("design:type", String)
], Job.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], Job.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_id', nullable: true }),
    __metadata("design:type", String)
], Job.prototype, "addressId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_address_entity_1.CustomerAddress, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'address_id' }),
    __metadata("design:type", customer_address_entity_1.CustomerAddress)
], Job.prototype, "installationAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_engineer_id', nullable: true }),
    __metadata("design:type", String)
], Job.prototype, "assignedEngineerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'assigned_engineer_id' }),
    __metadata("design:type", user_entity_1.User)
], Job.prototype, "assignedEngineer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by_id', nullable: true }),
    __metadata("design:type", String)
], Job.prototype, "createdById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by_id' }),
    __metadata("design:type", user_entity_1.User)
], Job.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: JobStatus, default: JobStatus.PENDING }),
    __metadata("design:type", String)
], Job.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Job.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Job.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'scheduled_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], Job.prototype, "scheduledDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'started_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Job.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Job.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completion_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Job.prototype, "completionNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estimated_total', type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Job.prototype, "estimatedTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_materials_cost', type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Job.prototype, "actualMaterialsCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_labour_cost', type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Job.prototype, "actualLabourCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_additional_cost', type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Job.prototype, "actualAdditionalCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_total', type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Job.prototype, "actualTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_invoiced', default: false }),
    __metadata("design:type", Boolean)
], Job.prototype, "isInvoiced", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => JobMaterialUsage, (m) => m.job, { cascade: true }),
    __metadata("design:type", Array)
], Job.prototype, "materialUsages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => JobLabourRecord, (l) => l.job, { cascade: true }),
    __metadata("design:type", Array)
], Job.prototype, "labourRecords", void 0);
exports.Job = Job = __decorate([
    (0, typeorm_1.Entity)('jobs')
], Job);
let JobMaterialUsage = class JobMaterialUsage extends base_entity_1.BaseEntity {
};
exports.JobMaterialUsage = JobMaterialUsage;
__decorate([
    (0, typeorm_1.Column)({ name: 'job_id' }),
    __metadata("design:type", String)
], JobMaterialUsage.prototype, "jobId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Job, (j) => j.materialUsages, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'job_id' }),
    __metadata("design:type", Job)
], JobMaterialUsage.prototype, "job", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_id' }),
    __metadata("design:type", String)
], JobMaterialUsage.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'product_id' }),
    __metadata("design:type", product_entity_1.Product)
], JobMaterialUsage.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 12, scale: 3 }),
    __metadata("design:type", Number)
], JobMaterialUsage.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_cost', type: 'numeric', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], JobMaterialUsage.prototype, "unitCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_cost', type: 'numeric', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], JobMaterialUsage.prototype, "totalCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], JobMaterialUsage.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recorded_by_id', nullable: true }),
    __metadata("design:type", String)
], JobMaterialUsage.prototype, "recordedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'recorded_by_id' }),
    __metadata("design:type", user_entity_1.User)
], JobMaterialUsage.prototype, "recordedBy", void 0);
exports.JobMaterialUsage = JobMaterialUsage = __decorate([
    (0, typeorm_1.Entity)('job_material_usages')
], JobMaterialUsage);
let JobLabourRecord = class JobLabourRecord extends base_entity_1.BaseEntity {
};
exports.JobLabourRecord = JobLabourRecord;
__decorate([
    (0, typeorm_1.Column)({ name: 'job_id' }),
    __metadata("design:type", String)
], JobLabourRecord.prototype, "jobId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Job, (j) => j.labourRecords, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'job_id' }),
    __metadata("design:type", Job)
], JobLabourRecord.prototype, "job", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'engineer_id', nullable: true }),
    __metadata("design:type", String)
], JobLabourRecord.prototype, "engineerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'engineer_id' }),
    __metadata("design:type", user_entity_1.User)
], JobLabourRecord.prototype, "engineer", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], JobLabourRecord.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hours_worked', type: 'numeric', precision: 8, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], JobLabourRecord.prototype, "hoursWorked", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hourly_rate', type: 'numeric', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], JobLabourRecord.prototype, "hourlyRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_cost', type: 'numeric', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], JobLabourRecord.prototype, "totalCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'work_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], JobLabourRecord.prototype, "workDate", void 0);
exports.JobLabourRecord = JobLabourRecord = __decorate([
    (0, typeorm_1.Entity)('job_labour_records')
], JobLabourRecord);
//# sourceMappingURL=job.entity.js.map