export const program = {
    schedule: {
        1: "day1", // Monday
        2: "day2", // Tuesday
        3: "rest", // Wednesday
        4: "day4", // Thursday
        5: "day5", // Friday
        6: "rest", // Saturday
        0: "rest"  // Sunday
    },
    days: {
        day1: {
            id: "day1",
            title_en: "Upper Body Power",
            title_fa: "قدرت بالا تنه",
            subtitle_en: "Strength Focus - Mechanical Tension",
            subtitle_fa: "تمرکز بر قدرت - تنش مکانیکی",
            exercises: [
                {
                    id: "ex1_1",
                    name_en: "Barbell Bench Press",
                    name_fa: "پرس سینه هالتر",
                    sets: 3,
                    reps: "4-6",
                    rpe: 8.5,
                    note_en: "Pyramid up with 2-3 lighter sets first.",
                    note_fa: "ابتدا ۲-۳ ست سبک‌تر بزنید."
                },
                {
                    id: "ex1_2",
                    name_en: "Weighted Pull-Ups",
                    name_fa: "بارفیکس با وزنه",
                    sets: 3,
                    reps: "5-8",
                    rpe: 8,
                    note_en: "",
                    note_fa: ""
                },
                {
                    id: "ex1_3",
                    name_en: "Standing Overhead Press",
                    name_fa: "پرس سرشانه ایستاده",
                    sets: 3,
                    reps: "6-8",
                    rpe: 8,
                    note_en: "",
                    note_fa: ""
                },
                {
                    id: "ex1_4",
                    name_en: "Chest-Supported T-Bar Row",
                    name_fa: "زیربغل تی-بار با تکیه‌گاه",
                    sets: 3,
                    reps: "6-8",
                    rpe: 8,
                    note_en: "",
                    note_fa: ""
                },
                {
                    id: "ex1_5",
                    name_en: "Forehead Face Pulls",
                    name_fa: "فیس پول (کشیدن طناب به سمت صورت)",
                    sets: 3,
                    reps: "12-15",
                    rpe: 8,
                    note_en: "Focus on posture/scapular retraction.",
                    note_fa: "تمرکز بر وضعیت بدن و انقباض کتف."
                }
            ]
        },
        day2: {
            id: "day2",
            title_en: "Legs (Maintenance)",
            title_fa: "پا (نگهداری)",
            subtitle_en: "High Intensity, Low Volume",
            subtitle_fa: "شدت بالا، حجم کم",
            exercises: [
                {
                    id: "ex2_1",
                    name_en: "Back Squat",
                    name_fa: "اسکوات هالتر",
                    sets: 2,
                    reps: "6-8",
                    rpe: 8,
                    note_en: "",
                    note_fa: ""
                },
                {
                    id: "ex2_2",
                    name_en: "Romanian Deadlift",
                    name_fa: "ددلیفت رومانیایی",
                    sets: 2,
                    reps: "8-10",
                    rpe: 8,
                    note_en: "",
                    note_fa: ""
                },
                {
                    id: "ex2_3",
                    name_en: "Leg Extension",
                    name_fa: "جلو پا دستگاه",
                    sets: 2,
                    reps: "10-12",
                    rpe: 9,
                    note_en: "",
                    note_fa: ""
                },
                {
                    id: "ex2_4",
                    name_en: "Seated Calf Raise",
                    name_fa: "ساق پا نشسته",
                    sets: 3,
                    reps: "15-20",
                    rpe: 9,
                    note_en: "",
                    note_fa: ""
                }
            ]
        },
        day4: {
            id: "day4",
            title_en: "Hypertrophy Push + Back Width",
            title_fa: "عضله‌سازی پرسی + پهنای پشت (V-Taper)",
            subtitle_en: "High Volume for Lats & Chest",
            subtitle_fa: "حجم بالا برای زیربغل و سینه",
            exercises: [
                {
                    id: "ex4_1",
                    name_en: "Low-Incline DB Press",
                    name_fa: "پرس بالا سینه دمبل (شیب کم)",
                    sets: 3,
                    reps: "10-12",
                    rpe: 8,
                    note_en: "15°-30° incline for upper chest.",
                    note_fa: "شیب ۱۵-۳۰ درجه برای بالای سینه."
                },
                {
                    id: "ex4_2",
                    name_en: "Wide-Grip Lat Pulldown",
                    name_fa: "زیربغل سیم‌کش دست باز",
                    sets: 3,
                    reps: "10-12",
                    rpe: 8,
                    note_en: "Pull with elbows for width.",
                    note_fa: "برای پهنا، با آرنج‌ها بکشید."
                },
                {
                    id: "ex4_3",
                    name_en: "Pec Deck / Cable Flye",
                    name_fa: "فلای سینه دستگاه / سیم‌کش",
                    sets: 3,
                    reps: "12-15",
                    rpe: 9,
                    note_en: "Constant tension.",
                    note_fa: "فشار مداوم."
                },
                {
                    id: "ex4_4",
                    name_en: "Cable Lateral Raises",
                    name_fa: "نشر جانب سیم‌کش",
                    sets: 4,
                    reps: "12-15",
                    rpe: 9,
                    note_en: "Priority exercise for width.",
                    note_fa: "تمرین اصلی برای پهنای شانه."
                },
                {
                    id: "ex4_5",
                    name_en: "Bayesian Cable Curl",
                    name_fa: "جلوبازو بایزین (سیم‌کش پشت بدن)",
                    sets: 3,
                    reps: "12-15",
                    rpe: 9,
                    note_en: "",
                    note_fa: ""
                },
                {
                    id: "ex4_6",
                    name_en: "Forehead Face Pulls",
                    name_fa: "فیس پول",
                    sets: 3,
                    reps: "15-20",
                    rpe: 9,
                    note_en: "",
                    note_fa: ""
                }
            ]
        },
        day5: {
            id: "day5",
            title_en: "Weak Point Day",
            title_fa: "روز نقاط ضعف",
            subtitle_en: "Posture, Upper Chest Shelf, Side Delts",
            subtitle_fa: "پوسچر، بالای سینه، بخش کناری شانه",
            exercises: [
                {
                    id: "ex5_1",
                    name_en: "Low-Incline DB Press",
                    name_fa: "پرس بالا سینه دمبل (شیب کم)",
                    sets: 3,
                    reps: "8-12",
                    rpe: 8,
                    note_en: "Concentrate on the stretch.",
                    note_fa: "تمرکز روی کشش."
                },
                {
                    id: "ex5_2",
                    name_en: "Moto Row",
                    name_fa: "زیربغل موتو (Moto Row)",
                    sets: 3,
                    reps: "10-12",
                    rpe: 8,
                    note_en: "Excellent for width & posture.",
                    note_fa: "عالی برای پهنا و پوسچر."
                },
                {
                    id: "ex5_3",
                    name_en: "Cable Lateral Raises",
                    name_fa: "نشر جانب سیم‌کش",
                    sets: 4,
                    reps: "15-20",
                    rpe: 10,
                    note_en: "Take last set to failure.",
                    note_fa: "ست آخر تا ناتوانی."
                },
                {
                    id: "ex5_4",
                    name_en: "Rope Upright Row",
                    name_fa: "کول سیم‌کش طناب",
                    sets: 3,
                    reps: "12-15",
                    rpe: 9,
                    note_en: "Stop at shoulder height.",
                    note_fa: "توقف در ارتفاع شانه."
                },
                {
                    id: "ex5_5",
                    name_en: "Chest-Supported Machine Row",
                    name_fa: "زیربغل دستگاه با تکیه‌گاه سینه",
                    sets: 3,
                    reps: "12-15",
                    rpe: 9,
                    note_en: "Squeeze shoulder blades.",
                    note_fa: "کتف‌ها را بهم فشار دهید."
                },
                {
                    id: "ex5_6",
                    name_en: "Forehead Face Pulls",
                    name_fa: "فیس پول",
                    sets: 4,
                    reps: "15-20",
                    rpe: 9,
                    note_en: "Hold squeeze for 1 sec.",
                    note_fa: "یک ثانیه مکث کنید."
                }
            ]
        }
    }
};
