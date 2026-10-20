"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const bcrypt = require("bcrypt");
async function runSeeds() {
    console.log('🌱 Starting database seed...\n');
    await data_source_1.AppDataSource.initialize();
    const queryRunner = data_source_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        console.log('  → Seeding permissions...');
        const permissions = [
            { permissionKey: 'users.view', moduleName: 'users', description: 'View users' },
            { permissionKey: 'users.create', moduleName: 'users', description: 'Create users' },
            { permissionKey: 'users.update', moduleName: 'users', description: 'Update users' },
            { permissionKey: 'users.delete', moduleName: 'users', description: 'Delete users' },
            { permissionKey: 'roles.view', moduleName: 'roles', description: 'View roles' },
            { permissionKey: 'roles.create', moduleName: 'roles', description: 'Create roles' },
            { permissionKey: 'roles.update', moduleName: 'roles', description: 'Update roles' },
            { permissionKey: 'roles.delete', moduleName: 'roles', description: 'Delete roles' },
            { permissionKey: 'menus.view', moduleName: 'menus', description: 'View menu configuration' },
            { permissionKey: 'menus.manage', moduleName: 'menus', description: 'Manage menu items' },
            { permissionKey: 'products.view', moduleName: 'products', description: 'View products' },
            { permissionKey: 'products.create', moduleName: 'products', description: 'Create products' },
            { permissionKey: 'products.update', moduleName: 'products', description: 'Update products' },
            { permissionKey: 'products.delete', moduleName: 'products', description: 'Delete products' },
            { permissionKey: 'inventory.view', moduleName: 'inventory', description: 'View stock' },
            { permissionKey: 'inventory.receive', moduleName: 'inventory', description: 'Receive stock' },
            { permissionKey: 'inventory.adjust', moduleName: 'inventory', description: 'Adjust stock' },
            { permissionKey: 'customers.view', moduleName: 'customers', description: 'View customers' },
            { permissionKey: 'customers.create', moduleName: 'customers', description: 'Create customers' },
            { permissionKey: 'customers.update', moduleName: 'customers', description: 'Update customers' },
            { permissionKey: 'customers.delete', moduleName: 'customers', description: 'Delete customers' },
            { permissionKey: 'suppliers.view', moduleName: 'suppliers', description: 'View suppliers' },
            { permissionKey: 'suppliers.create', moduleName: 'suppliers', description: 'Create suppliers' },
            { permissionKey: 'suppliers.update', moduleName: 'suppliers', description: 'Update suppliers' },
            { permissionKey: 'suppliers.delete', moduleName: 'suppliers', description: 'Delete suppliers' },
            { permissionKey: 'quotations.view', moduleName: 'quotations', description: 'View quotations' },
            { permissionKey: 'quotations.create', moduleName: 'quotations', description: 'Create quotations' },
            { permissionKey: 'quotations.update', moduleName: 'quotations', description: 'Update quotations' },
            { permissionKey: 'quotations.delete', moduleName: 'quotations', description: 'Delete quotations' },
            { permissionKey: 'quotations.approve', moduleName: 'quotations', description: 'Approve quotations' },
            { permissionKey: 'jobs.view', moduleName: 'jobs', description: 'View jobs' },
            { permissionKey: 'jobs.create', moduleName: 'jobs', description: 'Create jobs' },
            { permissionKey: 'jobs.update', moduleName: 'jobs', description: 'Update jobs' },
            { permissionKey: 'jobs.assign', moduleName: 'jobs', description: 'Assign engineers to jobs' },
            { permissionKey: 'invoices.view', moduleName: 'invoices', description: 'View invoices' },
            { permissionKey: 'invoices.create', moduleName: 'invoices', description: 'Create invoices' },
            { permissionKey: 'invoices.update', moduleName: 'invoices', description: 'Update invoices' },
            { permissionKey: 'reports.view', moduleName: 'reports', description: 'View reports' },
            { permissionKey: 'settings.manage', moduleName: 'settings', description: 'Manage company settings' },
        ];
        for (const perm of permissions) {
            await queryRunner.query(`
        INSERT INTO permissions (id, permission_key, module_name, description, is_active, created_at, updated_at)
        VALUES (uuid_generate_v4(), $1, $2, $3, true, NOW(), NOW())
        ON CONFLICT (permission_key) DO NOTHING
      `, [perm.permissionKey, perm.moduleName, perm.description]);
        }
        console.log('  → Seeding roles...');
        const roles = [
            { name: 'Super Admin', description: 'Full system access', isSystem: true },
            { name: 'Admin', description: 'Administrative access' },
            { name: 'Manager', description: 'Management access' },
            { name: 'Sales Staff', description: 'Sales and quotation access' },
            { name: 'Stock Manager', description: 'Inventory management access' },
            { name: 'Engineer', description: 'Field engineer access' },
            { name: 'Accountant', description: 'Financial access' },
        ];
        for (const role of roles) {
            await queryRunner.query(`
        INSERT INTO roles (id, name, description, is_active, is_system, created_at, updated_at)
        VALUES (uuid_generate_v4(), $1, $2, true, $3, NOW(), NOW())
        ON CONFLICT (name) DO NOTHING
      `, [role.name, role.description, role.isSystem || false]);
        }
        console.log('  → Assigning permissions to roles...');
        const adminPerms = permissions.map(p => p.permissionKey);
        await assignPermissionsToRole(queryRunner, 'Admin', adminPerms);
        await assignPermissionsToRole(queryRunner, 'Manager', [
            'products.view', 'products.create', 'products.update',
            'inventory.view', 'inventory.receive', 'inventory.adjust',
            'customers.view', 'customers.create', 'customers.update',
            'suppliers.view', 'suppliers.create',
            'quotations.view', 'quotations.create', 'quotations.update', 'quotations.approve',
            'jobs.view', 'jobs.create', 'jobs.update', 'jobs.assign',
            'invoices.view', 'invoices.create', 'invoices.update',
            'reports.view',
        ]);
        await assignPermissionsToRole(queryRunner, 'Sales Staff', [
            'products.view', 'customers.view', 'customers.create', 'customers.update',
            'quotations.view', 'quotations.create', 'quotations.update',
            'invoices.view', 'jobs.view',
        ]);
        await assignPermissionsToRole(queryRunner, 'Stock Manager', [
            'products.view', 'products.create', 'products.update',
            'inventory.view', 'inventory.receive', 'inventory.adjust',
            'suppliers.view', 'suppliers.create', 'suppliers.update',
        ]);
        await assignPermissionsToRole(queryRunner, 'Engineer', [
            'jobs.view', 'jobs.update',
            'products.view', 'inventory.view',
            'customers.view',
        ]);
        await assignPermissionsToRole(queryRunner, 'Accountant', [
            'invoices.view', 'invoices.create', 'invoices.update',
            'customers.view', 'quotations.view',
            'reports.view', 'jobs.view',
        ]);
        console.log('  → Seeding menus...');
        const menus = [
            { menuKey: 'dashboard', title: 'Dashboard', icon: 'LayoutDashboard', route: '/dashboard', sortOrder: 1, parentKey: null, requiredPermission: null },
            { menuKey: 'products-group', title: 'Products', icon: 'Package', route: null, sortOrder: 2, parentKey: null, requiredPermission: 'products.view', isCollapsible: true },
            { menuKey: 'products-list', title: 'Product Catalogue', icon: 'ShoppingBag', route: '/products', sortOrder: 1, parentKey: 'products-group', requiredPermission: 'products.view' },
            { menuKey: 'brands', title: 'Brands', icon: 'Tag', route: '/products/brands', sortOrder: 2, parentKey: 'products-group', requiredPermission: 'products.view' },
            { menuKey: 'categories', title: 'Categories', icon: 'FolderTree', route: '/products/categories', sortOrder: 3, parentKey: 'products-group', requiredPermission: 'products.view' },
            { menuKey: 'inventory-group', title: 'Inventory', icon: 'Warehouse', route: null, sortOrder: 3, parentKey: null, requiredPermission: 'inventory.view', isCollapsible: true },
            { menuKey: 'stock-overview', title: 'Stock Overview', icon: 'BarChart3', route: '/inventory', sortOrder: 1, parentKey: 'inventory-group', requiredPermission: 'inventory.view' },
            { menuKey: 'stock-movements', title: 'Stock Movements', icon: 'ArrowLeftRight', route: '/inventory/movements', sortOrder: 2, parentKey: 'inventory-group', requiredPermission: 'inventory.view' },
            { menuKey: 'receive-stock', title: 'Receive Stock', icon: 'PackagePlus', route: '/inventory/receive', sortOrder: 3, parentKey: 'inventory-group', requiredPermission: 'inventory.receive' },
            { menuKey: 'low-stock', title: 'Low Stock Alert', icon: 'AlertTriangle', route: '/inventory/low-stock', sortOrder: 4, parentKey: 'inventory-group', requiredPermission: 'inventory.view' },
            { menuKey: 'crm-group', title: 'CRM', icon: 'Users', route: null, sortOrder: 4, parentKey: null, requiredPermission: 'customers.view', isCollapsible: true },
            { menuKey: 'customers', title: 'Customers', icon: 'UserCircle', route: '/customers', sortOrder: 1, parentKey: 'crm-group', requiredPermission: 'customers.view' },
            { menuKey: 'suppliers', title: 'Suppliers', icon: 'Truck', route: '/suppliers', sortOrder: 2, parentKey: 'crm-group', requiredPermission: 'suppliers.view' },
            { menuKey: 'quotations', title: 'Quotations', icon: 'FileText', route: '/quotations', sortOrder: 5, parentKey: null, requiredPermission: 'quotations.view' },
            { menuKey: 'jobs', title: 'Installation Jobs', icon: 'Wrench', route: '/jobs', sortOrder: 6, parentKey: null, requiredPermission: 'jobs.view' },
            { menuKey: 'invoices-group', title: 'Finance', icon: 'Receipt', route: null, sortOrder: 7, parentKey: null, requiredPermission: 'invoices.view', isCollapsible: true },
            { menuKey: 'invoices', title: 'Invoices', icon: 'FileCheck', route: '/invoices', sortOrder: 1, parentKey: 'invoices-group', requiredPermission: 'invoices.view' },
            { menuKey: 'reports', title: 'Reports', icon: 'BarChart2', route: '/reports', sortOrder: 8, parentKey: null, requiredPermission: 'reports.view' },
            { menuKey: 'settings-group', title: 'Settings', icon: 'Settings', route: null, sortOrder: 9, parentKey: null, requiredPermission: 'settings.manage', isCollapsible: true },
            { menuKey: 'company-settings', title: 'Company Settings', icon: 'Building2', route: '/settings/company', sortOrder: 1, parentKey: 'settings-group', requiredPermission: 'settings.manage' },
            { menuKey: 'vat-settings', title: 'VAT Rates', icon: 'Percent', route: '/settings/vat', sortOrder: 2, parentKey: 'settings-group', requiredPermission: 'settings.manage' },
            { menuKey: 'user-management', title: 'Users', icon: 'Users2', route: '/settings/users', sortOrder: 3, parentKey: 'settings-group', requiredPermission: 'users.view' },
            { menuKey: 'roles-permissions', title: 'Roles & Permissions', icon: 'Shield', route: '/settings/roles', sortOrder: 4, parentKey: 'settings-group', requiredPermission: 'roles.view' },
            { menuKey: 'menu-management', title: 'Menu Management', icon: 'Menu', route: '/settings/menus', sortOrder: 5, parentKey: 'settings-group', requiredPermission: 'menus.manage' },
            { menuKey: 'audit-logs', title: 'Audit Logs', icon: 'ScrollText', route: '/settings/audit-logs', sortOrder: 6, parentKey: 'settings-group', requiredPermission: 'settings.manage' },
        ];
        for (const menu of menus.filter(m => !m.parentKey)) {
            await queryRunner.query(`
        INSERT INTO menus (id, menu_key, title, icon, route, sort_order, is_active, is_visible, is_collapsible, required_permission, parent_id, created_at, updated_at)
        VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, true, true, $6, $7, NULL, NOW(), NOW())
        ON CONFLICT (menu_key) DO NOTHING
      `, [menu.menuKey, menu.title, menu.icon || null, menu.route || null, menu.sortOrder, menu.isCollapsible || false, menu.requiredPermission || null]);
        }
        for (const menu of menus.filter(m => m.parentKey)) {
            const parentResult = await queryRunner.query('SELECT id FROM menus WHERE menu_key = $1', [menu.parentKey]);
            const parentId = parentResult[0]?.id;
            await queryRunner.query(`
        INSERT INTO menus (id, menu_key, title, icon, route, sort_order, is_active, is_visible, is_collapsible, required_permission, parent_id, created_at, updated_at)
        VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, true, true, $6, $7, $8, NOW(), NOW())
        ON CONFLICT (menu_key) DO NOTHING
      `, [menu.menuKey, menu.title, menu.icon || null, menu.route || null, menu.sortOrder, false, menu.requiredPermission || null, parentId || null]);
        }
        console.log('  → Seeding company settings...');
        await queryRunner.query(`
      INSERT INTO company_settings (
        id, name, email, phone, address_line1, city, postcode, country,
        vat_number, company_registration_number,
        quotation_prefix, invoice_prefix, job_prefix,
        quotation_next_number, invoice_next_number, job_next_number,
        default_payment_terms_days, default_quotation_valid_days,
        default_terms_and_conditions, created_at, updated_at
      ) VALUES (
        uuid_generate_v4(),
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        'TOG-', 'INV-', 'JOB-', 1001, 1001, 1001, 30, 30,
        'Payment is due within 30 days of invoice date. Late payments may incur interest charges. All prices include VAT where stated.',
        NOW(), NOW()
      )
      ON CONFLICT DO NOTHING
    `, [
            process.env.COMPANY_NAME || 'Toggar Heat & Aircon',
            process.env.COMPANY_EMAIL || 'info@toggarheatandaircon.com',
            process.env.COMPANY_PHONE || '+44 000 000 0000',
            process.env.COMPANY_ADDRESS_LINE1 || '1 Business Street',
            process.env.COMPANY_CITY || 'London',
            process.env.COMPANY_POSTCODE || 'SW1A 1AA',
            process.env.COMPANY_COUNTRY || 'United Kingdom',
            process.env.COMPANY_VAT_NUMBER || 'GB000000000',
            process.env.COMPANY_REGISTRATION_NUMBER || '00000000',
        ]);
        console.log('  → Seeding VAT rates...');
        await queryRunner.query(`
      INSERT INTO vat_rates (id, name, category, rate, description, is_active, is_default, created_at, updated_at)
      VALUES
        (uuid_generate_v4(), 'Standard Rate', 'standard', 20.00, 'Standard UK VAT rate (20%)', true, true, NOW(), NOW()),
        (uuid_generate_v4(), 'Reduced Rate', 'reduced', 5.00, 'Reduced VAT rate for energy-saving domestic installations', true, false, NOW(), NOW()),
        (uuid_generate_v4(), 'Zero Rated', 'zero', 0.00, 'Zero-rated VAT', true, false, NOW(), NOW()),
        (uuid_generate_v4(), 'Exempt', 'exempt', 0.00, 'VAT exempt supplies', true, false, NOW(), NOW())
      ON CONFLICT DO NOTHING
    `);
        console.log('  → Seeding stock location...');
        await queryRunner.query(`
      INSERT INTO stock_locations (id, name, description, is_active, is_default, created_at, updated_at)
      VALUES (uuid_generate_v4(), 'Main Warehouse', 'Primary stock location', true, true, NOW(), NOW())
      ON CONFLICT DO NOTHING
    `);
        console.log('  → Seeding HVAC product types, manufacturers and sample materials...');
        const productTypes = [
            ['Air Conditioning Indoor Units', 'Indoor fan coil and wall mounted units'],
            ['Air Conditioning Outdoor Units', 'Outdoor condenser and heat pump units'],
            ['Multi-Split Systems', 'Multi-port split systems and matched sets'],
            ['Copper Pipe & Coils', 'Copper tube, coils and refrigeration pipework'],
            ['Pipework & Flexible Hose', 'Flexible hoses, pre-insulated pipe and fittings'],
            ['Condensate Pumps & Drainage', 'Condensate pumps, trays and drainage parts'],
            ['Valves & Refrigerant Controls', 'Refrigerant valves and control components'],
            ['Mounting & Installation Accessories', 'Feet, brackets, supports and installation parts'],
            ['Controls & Electrical Accessories', 'Interfaces, Wi-Fi controls and electrical accessories'],
        ];
        for (let index = 0; index < productTypes.length; index++) {
            const [name, description] = productTypes[index];
            await queryRunner.query(`
        INSERT INTO categories (id, name, description, is_active, sort_order, created_at, updated_at)
        SELECT uuid_generate_v4(), $1::varchar, $2, true, $3, NOW(), NOW()
        WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = $1::varchar AND deleted_at IS NULL)
      `, [name, description, index + 1]);
        }
        const manufacturers = [
            ['Daikin', 'Air conditioning and heat pump equipment'],
            ['Mitsubishi Electric', 'Air conditioning equipment and controls'],
            ['General', 'Air conditioning equipment'],
            ['DiversiTech', 'HVAC installation and condensate products'],
            ['Freddox', 'Refrigeration and HVAC pipework products'],
            ['Inaba Denko', 'HVAC copper pipe and installation accessories'],
        ];
        for (const [name, description] of manufacturers) {
            await queryRunner.query(`
        INSERT INTO brands (id, name, description, is_active, created_at, updated_at)
        VALUES (uuid_generate_v4(), $1, $2, true, NOW(), NOW())
        ON CONFLICT (name) DO NOTHING
      `, [name, description]);
        }
        const sampleProducts = [
            {
                sku: 'DAIKIN-4MXM80A8', name: 'Daikin multi-split unit', model: '4MXM80A8',
                description: '4 Port R32 Multi 8kW', manufacturer: 'Daikin', category: 'Multi-Split Systems',
                cost: 2014.72, quantity: 1, unit: 'each',
            },
            {
                sku: '733851-UK', name: 'Mitsubishi Electric indoor unit', model: 'MSZ-AY20VGK2-E1',
                description: 'MSZ-AY20VGK2-E1 (WI-FI) INDOOR UNIT R32', manufacturer: 'Mitsubishi Electric', category: 'Air Conditioning Indoor Units',
                cost: 217.44, quantity: 10, unit: 'each',
            },
            {
                sku: 'CC30-3/8', name: 'Copper pipe coil', model: null,
                description: 'Soft Copper Coil 30m x 3/8" (9.53mm)', manufacturer: null, category: 'Copper Pipe & Coils',
                cost: 74.05, quantity: 30, unit: 'roll',
            },
        ];
        const [mainLocation] = await queryRunner.query(`SELECT id FROM stock_locations WHERE name = 'Main Warehouse' AND deleted_at IS NULL`);
        for (const item of sampleProducts) {
            const [brand] = item.manufacturer
                ? await queryRunner.query('SELECT id FROM brands WHERE name = $1 AND deleted_at IS NULL', [item.manufacturer])
                : [null];
            const [category] = await queryRunner.query('SELECT id FROM categories WHERE name = $1 AND deleted_at IS NULL ORDER BY created_at ASC LIMIT 1', [item.category]);
            await queryRunner.query(`
        INSERT INTO products (
          id, sku, name, description, model_number, manufacturer, purchase_price, selling_price,
          unit, reorder_level, is_active, is_stockable, brand_id, category_id, created_at, updated_at
        ) VALUES (
          uuid_generate_v4(), $1, $2, $3, $4, $5, $6, 0,
          $7, 0, true, true, $8, $9, NOW(), NOW()
        ) ON CONFLICT (sku) DO NOTHING
      `, [item.sku, item.name, item.description, item.model, item.manufacturer, item.cost, item.unit, brand?.id ?? null, category?.id ?? null]);
            const [product] = await queryRunner.query('SELECT id FROM products WHERE sku = $1 AND deleted_at IS NULL', [item.sku]);
            if (product && mainLocation) {
                const [balance] = await queryRunner.query('SELECT id FROM stock_balances WHERE product_id = $1 AND location_id = $2', [product.id, mainLocation.id]);
                if (!balance) {
                    await queryRunner.query(`
            INSERT INTO stock_balances (id, product_id, location_id, quantity_on_hand, quantity_reserved, quantity_available, created_at, updated_at)
            VALUES (uuid_generate_v4(), $1, $2, $3, 0, $3, NOW(), NOW())
          `, [product.id, mainLocation.id, item.quantity]);
                    await queryRunner.query(`
            INSERT INTO stock_movements (id, product_id, location_id, type, quantity, unit_cost, reference_type, reference_number, notes, created_at, updated_at)
            VALUES (uuid_generate_v4(), $1, $2, 'adjustment_in', $3, $4, 'seed', 'INITIAL-DEMO-STOCK', 'Opening demo balance from material sheet example', NOW(), NOW())
          `, [product.id, mainLocation.id, item.quantity, item.cost]);
                }
            }
        }
        console.log('  → Seeding super admin user...');
        const passwordHash = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD || 'ChangeMe@12345', 12);
        const email = process.env.SUPER_ADMIN_EMAIL || 'admin@toggarheatandaircon.com';
        const existingUser = await queryRunner.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.length === 0) {
            await queryRunner.query(`
        INSERT INTO users (id, first_name, last_name, email, password_hash, status, created_at, updated_at)
        VALUES (uuid_generate_v4(), $1, $2, $3, $4, 'active', NOW(), NOW())
      `, [
                process.env.SUPER_ADMIN_FIRST_NAME || 'Super',
                process.env.SUPER_ADMIN_LAST_NAME || 'Admin',
                email,
                passwordHash,
            ]);
            const [userRow] = await queryRunner.query('SELECT id FROM users WHERE email = $1', [email]);
            const [roleRow] = await queryRunner.query("SELECT id FROM roles WHERE name = 'Super Admin'");
            if (userRow && roleRow) {
                await queryRunner.query(`
          INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING
        `, [userRow.id, roleRow.id]);
            }
        }
        await queryRunner.commitTransaction();
        console.log('\n✅ Database seeded successfully!\n');
        console.log(`👤 Login: ${process.env.SUPER_ADMIN_EMAIL || 'admin@toggarheatandaircon.com'}`);
        console.log(`🔑 Password: ${process.env.SUPER_ADMIN_PASSWORD || 'ChangeMe@12345'}\n`);
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error('❌ Seed failed:', error);
        throw error;
    }
    finally {
        await queryRunner.release();
        await data_source_1.AppDataSource.destroy();
    }
}
async function assignPermissionsToRole(queryRunner, roleName, permKeys) {
    const [role] = await queryRunner.query('SELECT id FROM roles WHERE name = $1', [roleName]);
    if (!role)
        return;
    for (const key of permKeys) {
        const [perm] = await queryRunner.query('SELECT id FROM permissions WHERE permission_key = $1', [key]);
        if (perm) {
            await queryRunner.query('INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [role.id, perm.id]);
        }
    }
}
runSeeds().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
//# sourceMappingURL=run-seeds.js.map