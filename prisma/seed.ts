import { Prisma, PrismaClient, JobStatus, Language, Platform, Tone } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@zsp-aitool.local" },
    update: { name: "ผู้ใช้เดโม ZSP" },
    create: {
      email: "demo@zsp-aitool.local",
      name: "ผู้ใช้เดโม ZSP",
      password: "demo-password-hash"
    }
  });

  await prisma.userSetting.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      defaultLanguage: Language.TH,
      defaultTone: Tone.FRIENDLY,
      defaultPlatform: Platform.FACEBOOK,
      affiliateDisclosure: "โพสต์นี้มีลิงก์แอฟฟิลิเอต อาจมีค่าคอมมิชชันโดยไม่มีค่าใช้จ่ายเพิ่ม",
      defaultHashtags: ["#ของดีบอกต่อ", "#ช้อปคุ้ม", "#โปรเด็ด"]
    }
  });

  await prisma.product.deleteMany({ where: { userId: demoUser.id } });

  const products: Array<Prisma.ProductCreateInput> = [
    {
      user: { connect: { id: demoUser.id } },
      title: "หม้อทอดไร้น้ำมันดิจิทัล 5 ลิตร",
      price: new Prisma.Decimal("1590.00"),
      currency: "THB",
      originalUrl: "https://shopee.co.th/demo-airfryer-5l",
      affiliateUrl: "https://s.shopee.co.th/demo-aff-airfryer-5l",
      shopName: "บ้านเครื่องครัวคุณภาพ",
      rating: new Prisma.Decimal("4.80"),
      soldCount: 1240,
      description: "หม้อทอดไร้น้ำมัน ใช้งานง่าย ปรับอุณหภูมิได้ 80-200 องศา",
      category: "เครื่องใช้ไฟฟ้าในครัว",
      rawMetadata: { warranty: "1 ปี", color: "ดำ" },
      images: {
        create: [
          { url: "https://images.example.com/airfryer-1.jpg", altText: "ภาพสินค้า", sortOrder: 1 },
          { url: "https://images.example.com/airfryer-2.jpg", altText: "ด้านในหม้อ", sortOrder: 2 }
        ]
      }
    },
    {
      user: { connect: { id: demoUser.id } },
      title: "รองเท้าวิ่งน้ำหนักเบา รุ่นสปีดโปร",
      price: new Prisma.Decimal("1290.00"),
      currency: "THB",
      originalUrl: "https://shopee.co.th/demo-running-shoes-speedpro",
      affiliateUrl: "https://s.shopee.co.th/demo-aff-running-speedpro",
      shopName: "Sport Max Store",
      rating: new Prisma.Decimal("4.70"),
      soldCount: 890,
      description: "รองเท้าวิ่งพื้นนุ่ม ระบายอากาศดี เหมาะทั้งวิ่งและเดิน",
      category: "รองเท้ากีฬา",
      rawMetadata: { sizes: ["39", "40", "41", "42"], color: "ขาว/ฟ้า" },
      images: {
        create: [{ url: "https://images.example.com/shoes-1.jpg", altText: "รองเท้าวิ่งสปีดโปร", sortOrder: 1 }]
      }
    }
  ];

  const createdProducts = [];
  for (const productData of products) {
    const product = await prisma.product.create({ data: productData });
    createdProducts.push(product);
  }

  await prisma.contentTemplate.deleteMany({ where: { userId: demoUser.id } });
  await prisma.contentTemplate.createMany({
    data: [
      {
        userId: demoUser.id,
        name: "Facebook โปรโมชันสายรีวิว",
        description: "โพสต์แนะนำสินค้าแบบเป็นกันเองพร้อม disclosure",
        platform: Platform.FACEBOOK,
        tone: Tone.FRIENDLY,
        language: Language.TH,
        template:
          "ช่วยเขียนโพสต์ Facebook ภาษาไทย แนะนำ {{productTitle}} ราคา {{price}} บาท จุดเด่น {{description}} และปิดท้ายด้วยคำชวนซื้อที่สุภาพ พร้อมข้อความแจ้งว่าเป็นลิงก์แอฟฟิลิเอต",
        isDefault: true,
        isActive: true
      },
      {
        userId: demoUser.id,
        name: "Instagram แคปชันสั้น",
        description: "แคปชันพร้อมแฮชแท็ก 5 ตัว",
        platform: Platform.INSTAGRAM,
        tone: Tone.CASUAL,
        language: Language.TH,
        template:
          "สร้างแคปชัน Instagram ภาษาไทยไม่เกิน 120 คำ สำหรับ {{productTitle}} ให้ดูจริงใจ ไม่โอ้อวดเกินจริง และใส่ affiliate disclosure",
        isDefault: true,
        isActive: true
      }
    ]
  });

  await prisma.contentGeneration.deleteMany({ where: { userId: demoUser.id } });
  await prisma.contentGeneration.createMany({
    data: [
      {
        userId: demoUser.id,
        productId: createdProducts[0].id,
        platform: Platform.FACEBOOK,
        tone: Tone.FRIENDLY,
        language: Language.TH,
        prompt: "เขียนโพสต์โปรโมตหม้อทอดไร้น้ำมันแบบน่าเชื่อถือ",
        output: {
          headline: "หม้อทอดไร้น้ำมัน 5 ลิตร ใช้งานง่ายมาก",
          caption:
            "ใครหาไอเท็มทำอาหารคลีน แนะนำรุ่นนี้เลย ปรับอุณหภูมิได้ละเอียด ทำเมนูกรอบนอกนุ่มในได้ง่าย",
          hashtags: ["#หม้อทอดไร้น้ำมัน", "#ของใช้ในครัว", "#โปรเด็ด"],
          affiliateDisclosure: "โพสต์นี้มีลิงก์แอฟฟิลิเอต อาจมีค่าคอมมิชชัน"
        },
        tokenUsage: 542,
        status: JobStatus.COMPLETED
      },
      {
        userId: demoUser.id,
        productId: createdProducts[1].id,
        platform: Platform.THREADS,
        tone: Tone.CASUAL,
        language: Language.TH,
        prompt: "สรุปโพสต์สั้นชวนซื้อรองเท้าวิ่ง",
        output: {
          headline: "รองเท้าวิ่งเบา ใส่สบาย",
          caption: "วิ่งเช้า/เย็นก็เอาอยู่ พื้นนุ่ม เดินนานไม่เมื่อย มีลิงก์ไว้ในคอมเมนต์",
          hashtags: ["#รองเท้าวิ่ง", "#ออกกำลังกาย"],
          affiliateDisclosure: "มีลิงก์แอฟฟิลิเอต"
        },
        tokenUsage: 318,
        status: JobStatus.COMPLETED
      }
    ]
  });

  await prisma.oCRJob.deleteMany({ where: { userId: demoUser.id } });
  await prisma.oCRJob.create({
    data: {
      userId: demoUser.id,
      imageUrl: "https://images.example.com/demo-ocr-product.jpg",
      extractedText: "ชื่อสินค้า: หม้อทอดไร้น้ำมัน 5L ราคา 1,590 บาท เรตติ้ง 4.8",
      status: JobStatus.COMPLETED,
      errorMessage: null,
      rawResult: { confidence: 0.93 }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
