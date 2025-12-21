export const diet = {
    goals: {
        calories: 2310,
        protein: 230,
        carbs: 204,
        fats: 64,
        steps: 10000
    },
    meals: [
        {
            id: "meal1",
            name_en: "Breakfast",
            name_fa: "صبحانه",
            desc_en: "Quick Energy",
            desc_fa: "انرژی سریع",
            items: [
                { en: "2 Whole Eggs (Boiled/Scrambled)", fa: "۲ تخم مرغ کامل (آب‌پز/نیمرو)" },
                { en: "150g Egg Whites", fa: "۱۵۰ گرم سفیده تخم مرغ" },
                { en: "80g Oats + Water/Cinnamon", fa: "۸۰ گرم جو دوسر + آب/دارچین" }
            ],
            macros: { p: 35, c: 30, f: 12 } // Estimated fats from eggyolks
        },
        {
            id: "meal2",
            name_en: "Lunch",
            name_fa: "ناهار",
            desc_en: "The Office Meal",
            desc_fa: "وعده محل کار",
            items: [
                { en: "200g Chicken Breast (Cooked)", fa: "۲۰۰ گرم سینه مرغ (پخته شده)" },
                { en: "200g White Rice (Cooked)", fa: "۲۰۰ گرم برنج سفید (پخته شده)" },
                { en: "100g Green Veggies", fa: "۱۰۰ گرم سبزیجات سبز" },
                { en: "1 Tbsp Olive Oil", fa: "۱ قاشق غذاخوری روغن زیتون" }
            ],
            macros: { p: 60, c: 55, f: 14 }
        },
        {
            id: "meal3",
            name_en: "Pre-Workout Snack",
            name_fa: "میان وعده قبل تمرین",
            desc_en: "1.5 hours before gym",
            desc_fa: "۱.۵ ساعت قبل از باشگاه",
            items: [
                { en: "1 Scoop Whey Protein", fa: "۱ اسکوپ پروتئین وی" },
                { en: "1 Banana", fa: "۱ موز" },
                { en: "30g Almonds", fa: "۳۰ گرم بادام" }
            ],
            macros: { p: 25, c: 30, f: 15 }
        },
        {
            id: "meal4",
            name_en: "Post-Workout Dinner",
            name_fa: "شام بعد تمرین",
            desc_en: "Refuel",
            desc_fa: "سوخت‌گیری مجدد",
            items: [
                { en: "200g Lean Beef (5%) OR Chicken", fa: "۲۰۰ گرم گوشت گاو کم‌چرب یا مرغ" },
                { en: "300g Potato (Air fried/Boiled)", fa: "۳۰۰ گرم سیب‌زمینی (آب‌پز/هواپز)" },
                { en: "Big Green Salad", fa: "سالاد سبزیجات بزرگ" }
            ],
            macros: { p: 60, c: 50, f: 10 }
        },
        {
            id: "meal5",
            name_en: "Before Bed",
            name_fa: "قبل از خواب",
            desc_en: "Muscle Insurance",
            desc_fa: "بیمه عضله",
            items: [
                { en: "1 Scoop Whey OR 250g Greek Yogurt", fa: "۱ اسکوپ وی یا ۲۵۰ گرم ماست یونانی" }
            ],
            macros: { p: 25, c: 5, f: 2 }
        }
    ]
};
