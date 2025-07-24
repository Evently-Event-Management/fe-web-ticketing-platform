// {
//     image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2070&auto=format&fit=crop",
//         price: "10.00",
//     date: { month: "SEP", day: "18" },
//     title: "Indonesia - Korea Conference",
//         location: "Soehanna, Daerah Khusus Ibukota Yogyakarta, Indonesia",
// },

type Event = {
    image: string;
    price: string | null;
    date: {
        month: string;
        day: string;
    };
    title: string;
    location: string;
}


export type { Event };