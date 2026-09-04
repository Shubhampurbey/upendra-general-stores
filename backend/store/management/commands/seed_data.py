from decimal import Decimal
from django.core.management.base import BaseCommand
from store.models import CustomUser, Category, Product, StoreSetting, Order, OrderItem, Cart


class Command(BaseCommand):
    help = 'Seeds initial Indian Kirana categories, 35+ products, demo accounts, and orders'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Starting database seeding for Upendra General Stores...'))

        # 1. Store Settings
        setting, _ = StoreSetting.objects.get_or_create(
            id=1,
            defaults={
                'store_name': 'Upendra General Stores',
                'tagline': 'Your Trusted Local Grocery Store',
                'phone': '7295077559',
                'alt_phone': '+91 72950 77559',
                'address': 'Near Mahavir Chowk Ganguli, Benipatti',
                'opening_hours': '7:00 AM - 9:30 PM (All 7 Days Open)',
                'delivery_charge': Decimal('30.00'),
                'free_delivery_above': Decimal('249.00'),
                'is_store_open': True,
                'announcement': '✨ Welcome to Upendra General Stores • 100% Pure Groceries, Direct from Mandi • Free Delivery above ₹249!'
            }
        )
        self.stdout.write(self.style.SUCCESS('[OK] Store settings configured'))

        # 2. Users (Single Predefined Admin & Customer)
        from django.conf import settings
        admin_email = getattr(settings, 'ADMIN_EMAIL', 'upurbey753@gmail.com').strip()
        admin_mobile = getattr(settings, 'ADMIN_MOBILE', '7050830610').strip()
        admin_password = getattr(settings, 'ADMIN_PASSWORD', 'Upendra1234')

        # Remove legacy/test admin accounts (e.g. xyz@gmail.com) and release conflicting mobile if held by old test users
        CustomUser.objects.filter(email__in=['admin@upendrastores.com', 'xyz@gmail.com']).exclude(email__iexact=admin_email).delete()
        CustomUser.objects.filter(mobile=admin_mobile).exclude(email__iexact=admin_email).delete()

        admin_user = CustomUser.objects.filter(email__iexact=admin_email).first()
        if not admin_user:
            admin_user = CustomUser.objects.create_superuser(
                email=admin_email,
                password=admin_password,
                full_name='Upendra General Stores (Admin)',
                mobile=admin_mobile,
                role='admin',
                address='Near Mahavir Chowk Ganguli, Benipatti',
                city='Benipatti',
                state='Bihar',
                pincode='847213'
            )
        else:
            admin_user.set_password(admin_password)
            admin_user.role = 'admin'
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.mobile = admin_mobile
            admin_user.save()
        Cart.objects.get_or_create(user=admin_user)

        demo_customer, cust_created = CustomUser.objects.get_or_create(
            email='customer@gmail.com',
            defaults={
                'full_name': 'Ramesh Chandra Sharma',
                'mobile': '9812345678',
                'role': 'customer',
                'address': 'House No. 45, Shanti Kunj, Ward 8',
                'village_area': 'Shanti Nagar',
                'city': 'Benipatti',
                'state': 'Bihar',
                'pincode': '847213'
            }
        )
        if cust_created:
            demo_customer.set_password('Customer@123')
            demo_customer.save()
        Cart.objects.get_or_create(user=demo_customer)
        self.stdout.write(self.style.SUCCESS(f'[OK] Predefined Admin ({admin_email} / {admin_mobile}) & Customer created'))

        # 3. Main General Store Categories (8 Categories Only)
        categories_data = [
            {'name': 'Pulses & Dal', 'hindi_name': 'दाल एवं दलहन', 'slug': 'pulses-dal', 'icon': 'Wheat', 'order': 1, 'image': '/assets/images/dals.jpg', 'desc': 'Unpolished, rich in protein, clean traditional Indian dals'},
            {'name': 'Spices & Masala', 'hindi_name': 'मसाले', 'slug': 'spices-masala', 'icon': 'Flame', 'order': 2, 'image': '/assets/images/spices.jpg', 'desc': 'Pure, aromatic whole spices and ground masalas'},
            {'name': 'Dry Fruits', 'hindi_name': 'सूखे मेवे', 'slug': 'dry-fruits', 'icon': 'Nut', 'order': 3, 'image': '/assets/images/dry_fruits.jpg', 'desc': 'Premium cashews, almonds, raisins, and walnuts'},
            {'name': 'Namkeen & Snacks', 'hindi_name': 'नमकीन एवं स्नैक्स', 'slug': 'namkeen-snacks', 'icon': 'Cookie', 'order': 4, 'image': '/assets/images/namkeen.jpg', 'desc': 'Crispy bhujia, mixtures, tasty salted nuts, and mathri'},
            {'name': 'Chips & Wafers', 'hindi_name': 'चिप्स एवं वेफर्स', 'slug': 'chips-wafers', 'icon': 'Box', 'order': 5, 'image': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop&q=80', 'desc': 'Crunchy potato chips, banana chips, and masala wafers'},
            {'name': 'Rice & Atta', 'hindi_name': 'चावल एवं आटा', 'slug': 'rice-atta', 'icon': 'Wheat', 'order': 6, 'image': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80', 'desc': 'Aged Basmati rice and chakki-fresh whole wheat atta'},
            {'name': 'Oils & Desi Ghee', 'hindi_name': 'तेल एवं शुद्ध घी', 'slug': 'oils-ghee', 'icon': 'Droplets', 'order': 7, 'image': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80', 'desc': 'Cold-pressed mustard oil, refined oil, and pure desi cow ghee'},
            {'name': 'Daily Essentials', 'hindi_name': 'दैनिक उपयोग की वस्तुएं', 'slug': 'daily-essentials', 'icon': 'ShoppingBag', 'order': 8, 'image': 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80', 'desc': 'Sugar, premium CTC tea, salt, poha, garlic, ginger, and kitchen staples'},
        ]

        cat_objs = {}
        for cdata in categories_data:
            cat, _ = Category.objects.update_or_create(
                slug=cdata['slug'],
                defaults={
                    'name': cdata['name'],
                    'hindi_name': cdata['hindi_name'],
                    'icon': cdata['icon'],
                    'display_order': cdata['order'],
                    'image': cdata['image'],
                    'description': cdata['desc'],
                    'is_active': True,
                }
            )
            cat_objs[cdata['slug']] = cat

        self.stdout.write(self.style.SUCCESS(f'[OK] {len(cat_objs)} Categories created/updated'))

        # 4. Realistic Grocery Products (All mapped under the 8 main categories)
        products_data = [
            # 1. Pulses & Dal
            {
                'name': 'Arhar / Toor Dal (Desi)',
                'hindi_name': 'अरहर / तूर दाल',
                'category': cat_objs['pulses-dal'],
                'desc': 'Premium unpolished desi Arhar dal, rich in protein, cooks fast with delicious aroma.',
                'price': Decimal('160.00'),
                'unit': 'kg',
                'min_weight_grams': 250,
                'stock': Decimal('150.0'),
                'is_featured': True,
                'badge': 'Bestseller',
                'image': '/assets/images/dals.jpg',
            },
            {
                'name': 'Yellow Moong Dal (Dhuli)',
                'hindi_name': 'मूंग दाल धुली',
                'category': cat_objs['pulses-dal'],
                'desc': 'Clean, easy-to-digest yellow split moong dal, perfect for khichdi and daily dal tadka.',
                'price': Decimal('140.00'),
                'unit': 'kg',
                'min_weight_grams': 250,
                'stock': Decimal('100.0'),
                'is_featured': True,
                'badge': 'Fresh',
                'image': '/assets/images/dals.jpg',
            },
            {
                'name': 'Red Masoor Dal (Split)',
                'hindi_name': 'लाल मसूर दाल',
                'category': cat_objs['pulses-dal'],
                'desc': 'High fiber, fast-cooking red split lentils with natural earthy flavor.',
                'price': Decimal('110.00'),
                'unit': 'kg',
                'min_weight_grams': 250,
                'stock': Decimal('90.0'),
                'is_featured': False,
                'badge': '',
                'image': '/assets/images/dals.jpg',
            },
            {
                'name': 'Chana Dal (Desi)',
                'hindi_name': 'चना दाल',
                'category': cat_objs['pulses-dal'],
                'desc': 'Nutritious golden chana dal, unpolished and graded for supreme taste in tadka and snacks.',
                'price': Decimal('105.00'),
                'unit': 'kg',
                'min_weight_grams': 250,
                'stock': Decimal('120.0'),
                'is_featured': False,
                'badge': '',
                'image': '/assets/images/dals.jpg',
            },
            {
                'name': 'Urad Dal Dhuli (White)',
                'hindi_name': 'उड़द दाल धुली',
                'category': cat_objs['pulses-dal'],
                'desc': 'Washed white urad dal, ideal for fluffy idlis, crispy vadas, and dal makhani.',
                'price': Decimal('155.00'),
                'unit': 'kg',
                'min_weight_grams': 250,
                'stock': Decimal('80.0'),
                'is_featured': False,
                'badge': '',
                'image': '/assets/images/dals.jpg',
            },
            {
                'name': 'Kabuli Chana (Big Size)',
                'hindi_name': 'काबुली चना / छोले',
                'category': cat_objs['pulses-dal'],
                'desc': 'Jumbo size clean chickpeas, excellent for Punjabi Chhole and protein salads.',
                'price': Decimal('170.00'),
                'unit': 'kg',
                'min_weight_grams': 250,
                'stock': Decimal('110.0'),
                'is_featured': True,
                'badge': 'Top Quality',
                'image': '/assets/images/dals.jpg',
            },

            # 2. Spices & Masala (All whole & ground spices inside Spices & Masala)
            {
                'name': 'Whole Jeera (Royal Cumin Seeds)',
                'hindi_name': 'शाही साबुत जीरा',
                'category': cat_objs['spices-masala'],
                'desc': 'Clean, intensely aromatic whole cumin seeds handpicked from Rajasthan mandis.',
                'price': Decimal('420.00'),
                'unit': 'kg',
                'min_weight_grams': 100,
                'stock': Decimal('60.0'),
                'is_featured': True,
                'badge': 'Mandi Fresh',
                'image': '/assets/images/jeera.jpg',
            },
            {
                'name': 'Bhuna Jeera Powder (Roasted Cumin)',
                'hindi_name': 'भुना जीरा पाउडर',
                'category': cat_objs['spices-masala'],
                'desc': 'Slow roasted and finely ground cumin powder for raita, chaat, and buttermilk.',
                'price': Decimal('85.00'),
                'unit': 'packet',
                'min_weight_grams': 100,
                'stock': Decimal('50.0'),
                'is_featured': False,
                'badge': '',
                'image': '/assets/images/jeera.jpg',
            },
            {
                'name': 'Pure Haldi Powder (High Curcumin)',
                'hindi_name': 'शुद्ध हल्दी पाउडर',
                'category': cat_objs['spices-masala'],
                'desc': '100% pure turmeric powder with natural golden color and rich medicinal curcumin content.',
                'price': Decimal('260.00'),
                'unit': 'kg',
                'min_weight_grams': 100,
                'stock': Decimal('75.0'),
                'is_featured': True,
                'badge': '100% Pure',
                'image': '/assets/images/turmeric.jpg',
            },
            {
                'name': 'Whole Dry Haldi Ganth (Turmeric Fingers)',
                'hindi_name': 'साबुत हल्दी गांठ',
                'category': cat_objs['spices-masala'],
                'desc': 'Sun-dried raw whole turmeric roots for home grinding, puja rituals, and ayurvedic remedies.',
                'price': Decimal('220.00'),
                'unit': 'kg',
                'min_weight_grams': 100,
                'stock': Decimal('40.0'),
                'is_featured': False,
                'badge': '',
                'image': '/assets/images/turmeric.jpg',
            },
            {
                'name': 'Teekha Lal Mirch Powder',
                'hindi_name': 'तीखी लाल मिर्च पाउडर',
                'category': cat_objs['spices-masala'],
                'desc': 'Stone-ground spicy red chilli powder with fiery kick and rich red gravy color.',
                'price': Decimal('320.00'),
                'unit': 'kg',
                'min_weight_grams': 100,
                'stock': Decimal('80.0'),
                'is_featured': True,
                'badge': 'Spicy',
                'image': '/assets/images/red_chilli.jpg',
            },
            {
                'name': 'Kashmiri Lal Mirch (Mild & Bright Red)',
                'hindi_name': 'कश्मीरी लाल मिर्च',
                'category': cat_objs['spices-masala'],
                'desc': 'Low pungency Kashmiri red chilli powder giving gorgeous deep red hue to curries.',
                'price': Decimal('450.00'),
                'unit': 'kg',
                'min_weight_grams': 100,
                'stock': Decimal('45.0'),
                'is_featured': False,
                'badge': 'Rich Color',
                'image': '/assets/images/red_chilli.jpg',
            },
            {
                'name': 'Whole Dry Red Chilli (Stemless)',
                'hindi_name': 'साबुत सूखी लाल मिर्च',
                'category': cat_objs['spices-masala'],
                'desc': 'Crisp stemless sun-dried whole red chillies for authentic tadka.',
                'price': Decimal('340.00'),
                'unit': 'kg',
                'min_weight_grams': 100,
                'stock': Decimal('35.0'),
                'is_featured': False,
                'badge': '',
                'image': '/assets/images/red_chilli.jpg',
            },
            {
                'name': 'Aromatic Dhania Powder (Coriander)',
                'hindi_name': 'धनिया पाउडर',
                'category': cat_objs['spices-masala'],
                'desc': 'Freshly cold ground green coriander seeds with fragrant citrusy notes.',
                'price': Decimal('240.00'),
                'unit': 'kg',
                'min_weight_grams': 100,
                'stock': Decimal('90.0'),
                'is_featured': True,
                'badge': 'Fresh Aroma',
                'image': '/assets/images/coriander.jpg',
            },
            {
                'name': 'Whole Sabut Dhania Seeds',
                'hindi_name': 'साबुत धनिया',
                'category': cat_objs['spices-masala'],
                'desc': 'Whole dried coriander seeds for pickling, spice blends, and aromatic roasting.',
                'price': Decimal('200.00'),
                'unit': 'kg',
                'min_weight_grams': 100,
                'stock': Decimal('55.0'),
                'is_featured': False,
                'badge': '',
                'image': '/assets/images/coriander.jpg',
            },
            {
                'name': 'Whole Kali Mirch (Bold Malabar Black Pepper)',
                'hindi_name': 'साबुत काली मिर्च',
                'category': cat_objs['spices-masala'],
                'desc': 'Hand-picked plump black peppercorns with intense pungency and essential oils.',
                'price': Decimal('850.00'),
                'unit': 'kg',
                'min_weight_grams': 50,
                'stock': Decimal('40.0'),
                'is_featured': True,
                'badge': 'Malabar Bold',
                'image': '/assets/images/black_pepper.jpg',
            },
            {
                'name': 'Kali Mirch Powder (Fine Ground)',
                'hindi_name': 'काली मिर्च पाउडर',
                'category': cat_objs['spices-masala'],
                'desc': 'Finely ground black pepper powder in sealed aroma pouch.',
                'price': Decimal('95.00'),
                'unit': 'packet',
                'min_weight_grams': 100,
                'stock': Decimal('60.0'),
                'is_featured': False,
                'badge': '',
                'image': '/assets/images/black_pepper.jpg',
            },
            {
                'name': 'Aromatic Tej Patta (Indian Bay Leaves)',
                'hindi_name': 'सुगंधित तेज पत्ता',
                'category': cat_objs['spices-masala'],
                'desc': 'Unbroken large aromatic dried bay leaves for biryani, pulao, and rich curries.',
                'price': Decimal('280.00'),
                'unit': 'kg',
                'min_weight_grams': 50,
                'stock': Decimal('30.0'),
                'is_featured': False,
                'badge': '',
                'image': '/assets/images/bay_leaves.jpg',
            },
            {
                'name': 'Special Shahi Garam Masala',
                'hindi_name': 'शाही गरम मसाला',
                'category': cat_objs['spices-masala'],
                'desc': 'Upendra Store special secret blend of 15 royal spices roasted to perfection.',
                'price': Decimal('120.00'),
                'unit': 'packet',
                'min_weight_grams': 100,
                'stock': Decimal('70.0'),
                'is_featured': True,
                'badge': 'Secret Blend',
                'image': '/assets/images/spices.jpg',
            },
            {
                'name': 'Green Cardamom / Hari Elaichi (8mm Bold)',
                'hindi_name': 'हरी इलायची',
                'category': cat_objs['spices-masala'],
                'desc': 'Supreme quality aromatic green cardamom pods from Idukki, Kerala.',
                'price': Decimal('2800.00'),
                'unit': 'kg',
                'min_weight_grams': 25,
                'stock': Decimal('15.0'),
                'is_featured': True,
                'badge': 'Premium',
                'image': '/assets/images/spices.jpg',
            },
            {
                'name': 'Whole Cloves / Laung',
                'hindi_name': 'साबुत लौंग',
                'category': cat_objs['spices-masala'],
                'desc': 'Full head aromatic cloves packed with natural essential clove oil.',
                'price': Decimal('1100.00'),
                'unit': 'kg',
                'min_weight_grams': 50,
                'stock': Decimal('20.0'),
                'is_featured': False,
                'badge': '',
                'image': '/assets/images/spices.jpg',
            },

            # 3. Dry Fruits
            {
                'name': 'W320 Premium Cashews (Kaju)',
                'hindi_name': 'काजू साबुत',
                'category': cat_objs['dry-fruits'],
                'desc': 'Crisp, whole white cashew nuts, rich in healthy fats and sweet creamy crunch.',
                'price': Decimal('920.00'),
                'unit': 'kg',
                'min_weight_grams': 100,
                'stock': Decimal('50.0'),
                'is_featured': True,
                'badge': 'Handpicked',
                'image': '/assets/images/dry_fruits.jpg',
            },
            {
                'name': 'California Almonds (Badam Giri)',
                'hindi_name': 'बादाम गिरी',
                'category': cat_objs['dry-fruits'],
                'desc': 'Sweet, premium grade 100% natural California almonds packed with Vitamin E.',
                'price': Decimal('880.00'),
                'unit': 'kg',
                'min_weight_grams': 100,
                'stock': Decimal('60.0'),
                'is_featured': True,
                'badge': 'Top Seller',
                'image': '/assets/images/dry_fruits.jpg',
            },
            {
                'name': 'Golden Raisins (Kishmish)',
                'hindi_name': 'गोल्डन किशमिश',
                'category': cat_objs['dry-fruits'],
                'desc': 'Juicy sun-dried long seedless golden kishmish from Nashik vineyards.',
                'price': Decimal('360.00'),
                'unit': 'kg',
                'min_weight_grams': 100,
                'stock': Decimal('45.0'),
                'is_featured': False,
                'badge': 'Naturally Sweet',
                'image': '/assets/images/dry_fruits.jpg',
            },

            # 4. Namkeen & Snacks
            {
                'name': 'Crispy Aloo Bhujia Namkeen',
                'hindi_name': 'आलू भुजिया नमकीन',
                'category': cat_objs['namkeen-snacks'],
                'desc': 'Crispy, spiced potato sev seasoned with mint and traditional spices. Perfect tea-time snack.',
                'price': Decimal('55.00'),
                'unit': 'packet',
                'min_weight_grams': 200,
                'stock': Decimal('100.0'),
                'is_featured': True,
                'badge': 'Snack Time',
                'image': '/assets/images/namkeen.jpg',
            },
            {
                'name': 'Khatta Meetha Mixture Namkeen',
                'hindi_name': 'खट्टा मीठा मिक्सचर',
                'category': cat_objs['namkeen-snacks'],
                'desc': 'Delightful crunchy blend of sweet sev, roasted peanuts, puffed rice, and tangy spices.',
                'price': Decimal('55.00'),
                'unit': 'packet',
                'min_weight_grams': 200,
                'stock': Decimal('85.0'),
                'is_featured': False,
                'badge': '',
                'image': '/assets/images/namkeen.jpg',
            },
            {
                'name': 'Moong Dal Namkeen (Salted & Crispy)',
                'hindi_name': 'मूंग दाल नमकीन',
                'category': cat_objs['namkeen-snacks'],
                'desc': 'Lightly salted and golden fried split moong dal, crunchy and protein packed.',
                'price': Decimal('50.00'),
                'unit': 'packet',
                'min_weight_grams': 200,
                'stock': Decimal('70.0'),
                'is_featured': False,
                'badge': '',
                'image': '/assets/images/namkeen.jpg',
            },

            # 5. Chips & Wafers
            {
                'name': 'Classic Salted Potato Chips',
                'hindi_name': 'क्लासिक सॉल्टेड चिप्स',
                'category': cat_objs['chips-wafers'],
                'desc': 'Thinly sliced crispy golden potato wafers tossed in rock salt.',
                'price': Decimal('20.00'),
                'unit': 'packet',
                'min_weight_grams': 50,
                'stock': Decimal('150.0'),
                'is_featured': False,
                'badge': 'Crispy',
                'image': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop&q=80',
            },
            {
                'name': 'Spicy Masala Potato Chips',
                'hindi_name': 'मसाला पोटैटो चिप्स',
                'category': cat_objs['chips-wafers'],
                'desc': 'Zesty chatpata masala potato chips with authentic Indian street food punch.',
                'price': Decimal('20.00'),
                'unit': 'packet',
                'min_weight_grams': 50,
                'stock': Decimal('120.0'),
                'is_featured': True,
                'badge': 'Chatpata',
                'image': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop&q=80',
            },

            # 6. Rice & Atta
            {
                'name': 'Royal Aged Basmati Rice (XXL Grain)',
                'hindi_name': 'शाही बासमती चावल',
                'category': cat_objs['rice-atta'],
                'desc': '2-year aged long-grain aromatic basmati rice for fragrant biryani and pulao.',
                'price': Decimal('150.00'),
                'unit': 'kg',
                'min_weight_grams': 1000,
                'stock': Decimal('200.0'),
                'is_featured': True,
                'badge': 'Aged 2 Yrs',
                'image': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
            },
            {
                'name': 'Chakki Fresh Sharbati Atta (100% MP Wheat)',
                'hindi_name': 'चक्की फ्रेश शरबती आटा',
                'category': cat_objs['rice-atta'],
                'desc': 'Freshly ground 100% pure MP Sharbati whole wheat flour for soft, fluffy rotis.',
                'price': Decimal('48.00'),
                'unit': 'kg',
                'min_weight_grams': 1000,
                'stock': Decimal('300.0'),
                'is_featured': True,
                'badge': '100% Sharbati',
                'image': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
            },

            # 7. Oils & Desi Ghee
            {
                'name': 'Pure Desi Danedar Cow Ghee',
                'hindi_name': 'शुद्ध देशी दानेदार गाय का घी',
                'category': cat_objs['oils-ghee'],
                'desc': 'Traditional bilona method churned golden cow ghee with rich aroma and granular texture.',
                'price': Decimal('680.00'),
                'unit': 'liter',
                'min_weight_grams': 500,
                'stock': Decimal('40.0'),
                'is_featured': True,
                'badge': 'Pure Desi',
                'image': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
            },
            {
                'name': 'Kachi Ghani Mustard Oil (Sarson Tel)',
                'hindi_name': 'कच्ची घानी सरसों का तेल',
                'category': cat_objs['oils-ghee'],
                'desc': 'Cold-pressed 100% pure mustard oil with natural pungency and health benefits.',
                'price': Decimal('165.00'),
                'unit': 'liter',
                'min_weight_grams': 1000,
                'stock': Decimal('80.0'),
                'is_featured': True,
                'badge': 'Cold Pressed',
                'image': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80',
            },

            # 8. Daily Essentials
            {
                'name': 'Desi Khandsari / Sulfur-Free Sugar',
                'hindi_name': 'शुद्ध चीनी / खांड',
                'category': cat_objs['daily-essentials'],
                'desc': 'Clean, sparkling white crystal sugar without harmful bleaching chemicals.',
                'price': Decimal('46.00'),
                'unit': 'kg',
                'min_weight_grams': 500,
                'stock': Decimal('250.0'),
                'is_featured': False,
                'badge': 'Chemical Free',
                'image': 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=600&auto=format&fit=crop&q=80',
            },
            {
                'name': 'Assam CTC Premium Chai Patti (Tea)',
                'hindi_name': 'असम सीटीसी कड़क चाय पत्ती',
                'category': cat_objs['daily-essentials'],
                'desc': 'Strong, full-bodied aromatic Assam CTC tea leaves for the perfect kadak morning cup.',
                'price': Decimal('360.00'),
                'unit': 'kg',
                'min_weight_grams': 250,
                'stock': Decimal('70.0'),
                'is_featured': True,
                'badge': 'Kadak Chai',
                'image': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
            },
            {
                'name': 'Thick Poha (Flattened Rice)',
                'hindi_name': 'मोटा पोहा',
                'category': cat_objs['daily-essentials'],
                'desc': 'Clean, medium-thick flattened rice for soft and delicious breakfast Kanda Batata Poha.',
                'price': Decimal('55.00'),
                'unit': 'kg',
                'min_weight_grams': 500,
                'stock': Decimal('90.0'),
                'is_featured': False,
                'badge': '',
                'image': 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
            },
            {
                'name': 'Fresh Desi Garlic (Lahsun Bulbs)',
                'hindi_name': 'ताज़ा देशी लहसुन',
                'category': cat_objs['daily-essentials'],
                'desc': 'Locally harvested fresh garlic bulbs with tight skins and pungent robust cloves.',
                'price': Decimal('190.00'),
                'unit': 'kg',
                'min_weight_grams': 250,
                'stock': Decimal('45.0'),
                'is_featured': True,
                'badge': 'Farm Fresh',
                'image': '/assets/images/garlic.jpg',
            },
            {
                'name': 'Peeled Garlic Cloves (Chhila Lahsun)',
                'hindi_name': 'छिला हुआ लहसुन',
                'category': cat_objs['daily-essentials'],
                'desc': 'Hygienically pre-peeled fresh garlic cloves ready for quick cooking.',
                'price': Decimal('65.00'),
                'unit': 'packet',
                'min_weight_grams': 200,
                'stock': Decimal('25.0'),
                'is_featured': False,
                'badge': 'Quick Cook',
                'image': '/assets/images/garlic.jpg',
            },
            {
                'name': 'Fresh Mountain Ginger (Adrak)',
                'hindi_name': 'ताज़ा अदरक',
                'category': cat_objs['daily-essentials'],
                'desc': 'Juicy, fibrous, zesty ginger roots ideal for morning chai, gravies, and remedies.',
                'price': Decimal('160.00'),
                'unit': 'kg',
                'min_weight_grams': 250,
                'stock': Decimal('50.0'),
                'is_featured': True,
                'badge': 'Farm Fresh',
                'image': '/assets/images/ginger.jpg',
            },
        ]

        created_count = 0
        for pdata in products_data:
            p, created = Product.objects.update_or_create(
                name=pdata['name'],
                defaults={
                    'hindi_name': pdata['hindi_name'],
                    'category': pdata['category'],
                    'description': pdata['desc'],
                    'price': pdata['price'],
                    'unit': pdata['unit'],
                    'min_weight_grams': pdata['min_weight_grams'],
                    'stock_quantity': pdata['stock'],
                    'is_featured': pdata['is_featured'],
                    'badge': pdata['badge'],
                    'image': pdata['image'],
                    'is_available': True,
                }
            )
            if created:
                created_count += 1

        self.stdout.write(self.style.SUCCESS(f'[OK] {len(products_data)} Products seeded ({created_count} new)'))

        # 5. Demo Orders with realistic timelines
        if not Order.objects.exists():
            order1 = Order.objects.create(
                user=demo_customer,
                customer_name='Ramesh Chandra Sharma',
                customer_email='customer@gmail.com',
                customer_phone='9812345678',
                delivery_address='House No. 45, Shanti Kunj, Ward 8',
                village_area='Shanti Nagar',
                city='Varanasi',
                state='Uttar Pradesh',
                pincode='221002',
                subtotal=Decimal('625.00'),
                delivery_charge=Decimal('0.00'),
                total_amount=Decimal('625.00'),
                payment_method='cod',
                payment_status='paid',
                status='delivered',
                notes='Please call before coming to the door'
            )
            OrderItem.objects.create(
                order=order1,
                product=Product.objects.get(name='Arhar / Toor Dal (Desi)'),
                product_name='Arhar / Toor Dal (Desi)',
                category_name='Pulses & Dal',
                quantity=Decimal('2.0'),
                unit='kg',
                unit_price=Decimal('160.00'),
                subtotal=Decimal('320.00'),
                product_image='/assets/images/dals.jpg'
            )
            OrderItem.objects.create(
                order=order1,
                product=Product.objects.get(name='Whole Jeera (Royal Cumin Seeds)'),
                product_name='Whole Jeera (Royal Cumin Seeds)',
                category_name='Spices & Masala',
                quantity=Decimal('250.0'),
                unit='g',
                unit_price=Decimal('105.00'),
                subtotal=Decimal('105.00'),
                product_image='/assets/images/jeera.jpg'
            )
            OrderItem.objects.create(
                order=order1,
                product=Product.objects.get(name='Fresh Desi Garlic (Lahsun Bulbs)'),
                product_name='Fresh Desi Garlic (Lahsun Bulbs)',
                category_name='Daily Essentials',
                quantity=Decimal('1.0'),
                unit='kg',
                unit_price=Decimal('190.00'),
                subtotal=Decimal('190.00'),
                product_image='/assets/images/garlic.jpg'
            )

            order2 = Order.objects.create(
                user=demo_customer,
                customer_name='Ramesh Chandra Sharma',
                customer_email='customer@gmail.com',
                customer_phone='9812345678',
                delivery_address='House No. 45, Shanti Kunj, Ward 8',
                village_area='Shanti Nagar',
                city='Varanasi',
                state='Uttar Pradesh',
                pincode='221002',
                subtotal=Decimal('425.00'),
                delivery_charge=Decimal('30.00'),
                total_amount=Decimal('455.00'),
                payment_method='cod',
                payment_status='unpaid',
                status='preparing',
                notes='Leave at guard room if not home'
            )
            OrderItem.objects.create(
                order=order2,
                product=Product.objects.get(name='Pure Haldi Powder (High Curcumin)'),
                product_name='Pure Haldi Powder (High Curcumin)',
                category_name='Spices & Masala',
                quantity=Decimal('500.0'),
                unit='g',
                unit_price=Decimal('130.00'),
                subtotal=Decimal('130.00'),
                product_image='/assets/images/turmeric.jpg'
            )
            OrderItem.objects.create(
                order=order2,
                product=Product.objects.get(name='Aromatic Tej Patta (Indian Bay Leaves)'),
                product_name='Aromatic Tej Patta (Indian Bay Leaves)',
                category_name='Spices & Masala',
                quantity=Decimal('200.0'),
                unit='g',
                unit_price=Decimal('56.00'),
                subtotal=Decimal('56.00'),
                product_image='/assets/images/bay_leaves.jpg'
            )
            OrderItem.objects.create(
                order=order2,
                product=Product.objects.get(name='Crispy Aloo Bhujia Namkeen'),
                product_name='Crispy Aloo Bhujia Namkeen',
                category_name='Namkeen & Snacks',
                quantity=Decimal('2.0'),
                unit='packet',
                unit_price=Decimal('55.00'),
                subtotal=Decimal('110.00'),
                product_image='/assets/images/namkeen.jpg'
            )
            OrderItem.objects.create(
                order=order2,
                product=Product.objects.get(name='Fresh Mountain Ginger (Adrak)'),
                product_name='Fresh Mountain Ginger (Adrak)',
                category_name='Daily Essentials',
                quantity=Decimal('500.0'),
                unit='g',
                unit_price=Decimal('80.00'),
                subtotal=Decimal('80.00'),
                product_image='/assets/images/ginger.jpg'
            )
            self.stdout.write(self.style.SUCCESS('[OK] Demo orders seeded with active statuses'))

        self.stdout.write(self.style.SUCCESS('[OK] All database seed data generated successfully!'))
