// This file consolidates all administrative unit data for various countries.
//
// IMPORTANT: This data is illustrative and NOT exhaustive for all countries.
// For Kenya, it includes data up to the Ward level.
// You MUST populate this with your comprehensive, real-world administrative units
// based on your specific needs and official government data.

const allAdministrativeUnits = {
    kenya: {
        // AdminUnit1
        counties: [
            "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo/Marakwet", "Embu", "Garissa", "Homa Bay", "Isiolo", "Kajiado",
            "Kakamega", "Kericho", "Kiambu", "Kilifi", "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia",
            "Lamu", "Machakos", "Makueni", "Mandera", "Meru", "Migori", "Marsabit", "Mombasa", "Murang'a", "Nairobi",
            "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua", "Nyeri", "Samburu", "Siaya", "Taita Taveta", "Tana River",
            "Tharaka Nithi", "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot"
        ],
        // AdminUnit2 - keyed by County name
        subCounties: {
            "Nairobi": [
                "Dagoretti North", "Dagoretti South", "Embakasi Central", "Embakasi East",
                "Embakasi North", "Embakasi South", "Embakasi West", "Kamukunji", "Kasarani",
                "Kibra", "Lang'ata", "Makadara", "Mathare", "Roysambu", "Ruaraka", "Starehe", "Westlands"
            ],
            "Nakuru": [
                "Nakuru Town East", "Nakuru Town West", "Rongai", "Bahati", "Gilgil",
                "Naivasha", "Molo", "Njoro", "Subukia"
            ],
            "Mombasa": [
                "Mvita", "Kisauni", "Nyali", "Changamwe", "Likoni", "Jomvu"
            ],
            "Kitui": [
                "Kitui Central", "Kitui East", "Kitui Rural", "Kitui South", "Mwingi Central",
                "Mwingi North", "Mwingi West", "Mutitu North"
            ],
            "Kwale": ["Matuga", "Kinango", "Msambweni", "Lunga Lunga"],
            "Kiambu": ["Kiambu Town", "Limuru", "Gatundu South", "Juja", "Ruiru", "Kabete", "Githunguri"],
            "Machakos": ["Machakos Town", "Masinga", "Yatta", "Matungulu", "Kathiani", "Kangundo", "Mwala"],
            // ... Add all sub-counties for all 47 counties here
            "Baringo": ["Baringo Central", "Baringo North", "Mogotio", "Koibatek", "Eldama Ravine"],
            "Bomet": ["Bomet Central", "Chepalungu", "Konoin", "Sotik", "Bomet East"],
            // Add more as needed, but this example gives a good start.
        },
        // AdminUnit3 - keyed by Sub-County name
        // (Wards are often numerous, so populate as needed. This is a partial example for Nairobi)
        wards: {
            // Nairobi Wards
            "Dagoretti North": ["Kileleshwa", "Kilimani", "Kawangware", "Gatina", "Mutuini"],
            "Dagoretti South": ["Ngando", "Riruta", "Uthiru/Ruthimitu", "Waithaka"],
            "Embakasi Central": ["Matopeni/Spring Valley", "Mowlem", "Kayole North", "Kayole Central", "Kayole South"],
            "Embakasi East": ["Upper Savanna", "Lower Savanna", "Embakasi", "Utawala", "Mihango"],
            "Embakasi North": ["Kariobangi North", "Dandora Area I", "Dandora Area II", "Dandora Area III", "Dandora Area IV"],
            "Embakasi South": ["Imara Daima", "Kwa Reuben", "Kwa Njenga", "Pipeline", "Kware"],
            "Embakasi West": ["Umoja I", "Umoja II", "Mowlem", "Kariobangi South"],
            "Kamukunji": ["Pumwani", "Eastleigh North", "Eastleigh South", "Airbase", "California"],
            "Kasarani": ["Mwiki", "Kasarani", "Njiru", "Ruai", "Baharini"],
            "Kibra": ["Laini Saba", "Lindi", "Makina", "Sarang'ombe", "Woodley/Kenyatta Golf Course"],
            "Lang'ata": ["Karen", "Nairobi West", "Mugumo-ini", "South C", "Otiende", "Nyayo Highrise"],
            "Makadara": ["Makongeni", "Maringo/Hamza", "Harambee", "Makadara", "Viwandani", "Shauri Moyo"],
            "Mathare": ["Hospital", "Mabatini", "Huruma", "Kiamaiko", "Ngomongo", "Mutuini"], // Note: Mutuini is duplicated, needs correction if in real data
            "Roysambu": ["Roysambu", "Kahawa West", "Githurai", "Zimmerman", "Ruaraka"], // Note: Ruaraka sub-county also exists
            "Ruaraka": ["Baba Dogo", "Utalii", "Korogocho", "Kariobangi North", "Lucky Summer"],
            "Starehe": ["Central Business District", "Ngara", "Nairobi South", "Pangani", "Landi Mawe", "Ziwani/Kariokor"],
            "Westlands": ["Kitisuru", "Parklands/Highridge", "Karura", "Kangemi", "Mountain View"],

            // Nakuru Wards
            "Nakuru Town East": ["Biashara", "Shauri Yako", "Kivumbini", "Flamingo", "Lake View", "Bondeni", "Manyani"],
            "Nakuru Town West": ["Barut", "London", "Kapkures", "White House", "Mwakinyaka", "Kirobon"],
            "Naivasha": ["Biashara (Naivasha)", "Lake View (Naivasha)", "Hell's Gate", "Olkaria", "Maai Mahiu", "Longonot", "Maimahiu"],
            "Molo": ["Molo Town", "Kibunja", "Turi", "Elburgon"],

            // Mombasa Wards
            "Mvita": ["Majengo", "Ganjoni", "Shimanzi", "Makadara", "Tudor", "Mji wa Kale", "Mombasa Central"],
            "Kisauni": ["Kisauni", "Mjambere", "Junda", "Bamburi", "Mwakirunge", "Mtopanga", "Magogoni"],

            // Kitui Wards
            "Kitui Central": ["Miambani", "Township", "Manyenyoni", "Kyaithani", "Malili/Wote"],
            "Mwingi Central": ["Mwingi Central", "Kyuso", "Mumoni", "Waita", "Kanyangi"],

            // Kwale Wards
            "Matuga": ["Tsimba/Kichumakunda", "Waa", "Tiwi", "Kubo South"],
            "Msambweni": ["Gombato/Bongwe", "Ukunda", "Kinondo", "Ramisi"],

            // NO 'locations' field for Kenya in this file.
        },
    },
    uganda: {
        regions: [ // Equivalent to AdminUnit1
            "Central Region", "Eastern Region", "Northern Region", "Western Region"
        ],
        districts: { // Equivalent to AdminUnit2
            "Central Region": [
                "Bakalisa", "Buikwe", "Buvuma", "Gomba", "Kalangala", "Kalungu", "Kampala", "Kayunga", "Kiboga", "Kyankwanzi",
                "Luweero", "Lwengo", "Lyantonde", "Masaka", "Mityana", "Mpigi", "Mubende", "Mukono", "Nakaseke", "Nakasongola",
                "Rakai", "Sembabule", "Wakiso"
            ],
            "Eastern Region": [
                "Amuria", "Budaka", "Bududa", "Bugiri", "Bukedea", "Bukwa", "Bulambuli", "Busia", "Butaleja", "Butebo",
                "Buyende", "Dokolo", "Gulu", "Iganga", "Jinja", "Kaabong", "Kaliro", "Kamuli", "Kapchorwa", "Katakwi",
                "Kibuku", "Kitgum", "Koboko", "Kotido", "Kween", "Lira", "Luuka", "Manafwa", "Mayuge", "Mbale",
                "Namayingo", "Namutumba", "Ngora", "Oyam", "Pallisa", "Serere", "Soroti", "Tororo"
            ],
            // ... add more districts for other regions
        },
        // You can add further levels like 'subcounties' or 'parishes' here if needed for Uganda
        // e.g., subcounties: { "Kampala": ["Central", "Kawempe", "Makindye"] }
    },
    tanzania: {
        regions: [ // AdminUnit1
            "Arusha", "Dar es Salaam", "Dodoma", "Geita", "Iringa", "Kagera", "Kigoma", "Kilimanjaro", "Lindi", "Manyara",
            "Mara", "Mbeya", "Morogoro", "Mtwara", "Mwanza", "Njombe", "Pemba North", "Pemba South", "Pwani", "Rukwa",
            "Ruvuma", "Shinyanga", "Simiyu", "Singida", "Songwe", "Tabora", "Tanga", "Unguja North", "Unguja South", "Unguja Urban/West"
        ],
        districts: { // AdminUnit2
            "Dar es Salaam": ["Ilala", "Kinondoni", "Temeke", "Kigamboni", "Ubungo"],
            "Arusha": ["Arusha Urban", "Arusha Rural", "Longido", "Meru", "Monduli", "Karatu"]
            // IMPORTANT: Populate with all districts for your chosen regions
        },
        // You can add further levels like 'wards' or 'streets' here if needed for Tanzania
    },
    somalia: {
        regions: [ // AdminUnit1
            "Awdal", "Bakool", "Banaadir", "Bari", "Bay", "Galguduud", "Gedo", "Hiraan", "Lower Juba", "Lower Shabelle",
            "Middle Juba", "Middle Shabelle", "Mudug", "Nugaal", "Sanaag", "Sool", "Togdheer", "Woqooyi Galbeed"
        ],
        districts: { // AdminUnit2
            "Banaadir": ["Abdiaziz", "Bondhere", "Daynile", "Dharkenley", "Hammar Jajab", "Hamar Weyne", "Hodan", "Howl Wadag", "Karaan", "Kaxda", "Shangani", "Shibis", "Waberi", "Wadajir", "Wardhigley", "Yaakshid"],
            "Bari": ["Bossaso", "Caluula", "Iskushuban", "Qandala", "Bandarbeyla"]
            // IMPORTANT: Populate with all districts for your chosen regions
        },
        // Add further admin levels for Somalia if required
    },
    sudan: {
        states: [ // AdminUnit1
            "Al Jazirah", "Al Qadarif", "Blue Nile", "Kassala", "Khartoum", "North Kordofan", "Northern", "Red Sea", "River Nile",
            "Sennar", "South Kordofan", "West Kordofan", "White Nile", "Darfur (various states, simplified here)"
        ],
        localities: { // AdminUnit2
            "Khartoum": ["Khartoum", "Omdurman", "Khartoum North"],
            "Al Jazirah": ["Wad Madani", "Al Hasaheisa"]
            // IMPORTANT: Populate with all localities for your chosen states
        },
        // Add further admin levels for Sudan if required
    },
    "south sudan": {
        states: [ // AdminUnit1
            "Central Equatoria", "Eastern Equatoria", "Western Equatoria", "Jonglei", "Lakes", "Northern Bahr el Ghazal",
            "Unity", "Upper Nile", "Warrap", "Western Bahr el Ghazal", "Ruweng Administrative Area", "Pibor Administrative Area"
        ],
        counties: { // AdminUnit2
            "Central Equatoria": ["Juba", "Lainya", "Kajo Keji", "Terekeka", "Yei", "Mundri"],
            "Jonglei": ["Bor South", "Twic East", "Duk"]
            // IMPORTANT: Populate with all counties for your chosen states
        },
        // Add further admin levels for South Sudan if required
    },
    ethiopia: {
        regions: [ // AdminUnit1
            "Afar", "Amhara", "Benishangul-Gumuz", "Gambela", "Harari", "Oromia", "Sidama", "Somali",
            "Southern Nations, Nationalities, and Peoples' Region (SNNPR)", "Tigray",
            "South West Ethiopia Peoples' Region", "Central Ethiopia Region", "Sidama Region"
        ],
        zones: { // AdminUnit2
            "Oromia": ["Arsi", "Bale", "Borena", "East Hararghe", "East Shewa", "East Wellega", "Ilubabor", "Jimma",
                "Kelem Wellega", "North Shewa", "West Arsi", "West Hararghe", "West Shewa", "West Wellega"],
            "Amhara": ["North Gondar", "South Gondar", "North Wollo", "South Wollo", "North Shewa", "Oromia Zone"]
            // IMPORTANT: Populate with all zones for your chosen regions
        },
        // Add further admin levels like 'woredas' (districts) or 'kebeles' (neighborhoods) here for Ethiopia
    },
    rwanda: {
        provinces: [ // AdminUnit1
            "Eastern Province", "Kigali City", "Northern Province", "Southern Province", "Western Province"
        ],
        districts: { // AdminUnit2
            "Kigali City": ["Gasabo", "Kicukiro", "Nyarugenge"],
            "Eastern Province": ["Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana"]
            // IMPORTANT: Populate with all districts for your chosen provinces
        },
        // Add further admin levels like 'sectors' or 'cells' here for Rwanda
    },
    burundi: {
        provinces: [ // AdminUnit1
            "Bubanza", "Bujumbura Mairie", "Bujumbura Rural", "Bururi", "Canacuzo", "Cibitoke", "Gitega", "Karuzi", "Kayanza", "Kirundo",
            "Makamba", "Muramvya", "Muyinga", "Mwaro", "Ngozi", "Rumonge", "Rutana", "Ruyigi"
        ],
        // You would add districts or communes here as AdminUnit2, if available
        // districts: { "Bujumbura Mairie": ["Muha", "Mukaza", "Ntahangwa"] } // Example
    },
    congo: { // Assuming DRC - Democratic Republic of Congo
        provinces: [ // AdminUnit1
            "Bas-Uélé", "Équateur", "Haut-Katanga", "Haut-Lomami", "Haut-Uélé", "Ituri", "Kasai", "Kasai-Central",
            "Kasai-Oriental", "Kinshasa", "Kongo Central", "Kwango", "Kwilu", "Lomami", "Lualaba", "Mai-Ndombe",
            "Maniema", "Mongala", "Nord-Kivu", "Nord-Ubangi", "Sankuru", "Sud-Kivu", "Sud-Ubangi", "Tanganyika", "Tshopo", "Tshuapa"
        ],
        // You would add 'territories' or 'cities' as AdminUnit2 here, if available
        // territories: { "Nord-Kivu": ["Beni", "Lubero", "Masisi", "Rutshuru", "Walikale"] } // Example
    }
};

export default allAdministrativeUnits;