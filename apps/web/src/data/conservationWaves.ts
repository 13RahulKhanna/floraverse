// Static editorial content — deliberately not backend-driven, same pattern as the About
// page: fixed, hand-written guidance rather than something that needs per-user data.

export interface ConservationAction {
  title: string;
  detail: string;
}

export interface ConservationWave {
  wave: number;
  scale: string;
  tagline: string;
  intro: string;
  actions: ConservationAction[];
}

export const CONSERVATION_WAVES: ConservationWave[] = [
  {
    wave: 1,
    scale: "Your House",
    tagline: "Start where you already have control",
    intro:
      "The easiest conservation habits to build are the ones inside your own walls and yard — no permission, budget, or committee required.",
    actions: [
      {
        title: "Grow a few indoor plants",
        detail:
          "Even a small collection on a windowsill (try the Snake Plant, Pothos, or Peace Lily from this encyclopedia — all genuinely low-maintenance) helps moderate indoor humidity and gives you daily practice reading a plant's needs.",
      },
      {
        title: "Start composting kitchen scraps",
        detail:
          "Fruit and vegetable peels, coffee grounds, and eggshells break down into nutrient-rich soil for a herb pot or garden bed, cutting both landfill waste and your need for bought fertilizer.",
      },
      {
        title: "Choose native or drought-tolerant plants outdoors",
        detail:
          "A yard or balcony planted with species suited to your local climate needs far less water and almost no pesticide intervention, since local insects and soil microbes already know how to work with them.",
      },
      {
        title: "Cut back on chemical pesticides and fertilizers",
        detail:
          "Synthetic lawn and garden chemicals runoff into local waterways. Compost, mulch, and companion planting (like Marigold, which helps repel certain pests) cover most of what a home garden needs.",
      },
      {
        title: "Collect rainwater for watering",
        detail:
          "A simple barrel under a downspout can cover most of a small garden's water needs through the growing season, reducing treated tap water use.",
      },
      {
        title: "Avoid planting known invasive species",
        detail:
          "Some ornamental plants (fast-spreading vines and aggressive grasses especially) escape garden borders and outcompete native vegetation nearby — check before you plant something unfamiliar.",
      },
    ],
  },
  {
    wave: 2,
    scale: "Your Neighbourhood",
    tagline: "Multiply your effort through the people around you",
    intro:
      "One household composting is a habit. A street of households composting, planting, and sharing seeds is a shift in how a whole community treats its green space.",
    actions: [
      {
        title: "Start or join a community garden",
        detail:
          "Shared plots turn unused land into food production and a shared reason for neighbors to coordinate on watering, composting, and pest management collectively.",
      },
      {
        title: "Organize a neighborhood tree-planting day",
        detail:
          "Street trees and shared green spaces benefit from coordinated planting — more hands means more trees get properly watered and staked in their first critical year.",
      },
      {
        title: "Run a seed or cutting swap",
        detail:
          "Propagating and sharing cuttings (easy with plants like Pothos or Aloe Vera) spreads plant diversity through a neighborhood at zero cost and builds a habit of exchange over disposal.",
      },
      {
        title: "Advocate for pollinator-friendly shared spaces",
        detail:
          "Ask whoever manages shared lawns or verges to leave a strip unmowed or plant flowering natives — pollinator corridors need contiguous, not isolated, patches of flowers to actually work.",
      },
      {
        title: "Set up a shared composting bin",
        detail:
          "Apartment buildings or streets without individual yards can still divert food waste through one shared bin, usually with far less effort than it sounds.",
      },
      {
        title: "Help neighbors identify and remove invasive plants",
        detail:
          "Many invasive species spread silently through untended lots and gardens — a coordinated, informed removal effort is far more effective than one household acting alone.",
      },
    ],
  },
  {
    wave: 3,
    scale: "Your City",
    tagline: "Push for the infrastructure that individuals can't build alone",
    intro:
      "Street trees, public parks, and urban wetlands are maintained — or neglected — by municipal decisions. This is the scale where showing up to a city council meeting matters as much as planting a tree.",
    actions: [
      {
        title: "Support urban forestry and street-tree programs",
        detail:
          "Many cities run tree-planting initiatives that rely on resident requests and volunteer maintenance crews — request one for your street, or volunteer to help maintain young trees already planted.",
      },
      {
        title: "Advocate for green roofs and vertical gardens",
        detail:
          "On commercial and public buildings, green roofs reduce the urban heat-island effect and stormwater runoff — pushing for them in new development approvals is a high-leverage ask.",
      },
      {
        title: "Protect existing parks, wetlands, and green corridors",
        detail:
          "Established green spaces are far more ecologically valuable than new plantings of the same size — showing up to oppose their rezoning or reduction protects decades of established habitat.",
      },
      {
        title: "Push for reduced pesticide and herbicide use in public parks",
        detail:
          "Municipal spraying programs are often legacy policy rather than necessity — many cities have successfully switched to integrated pest management after resident advocacy.",
      },
      {
        title: "Support biodiversity corridors connecting green spaces",
        detail:
          "Isolated parks support far less wildlife than parks linked by planted corridors (even narrow ones along waterways or rail lines) that let species move between them.",
      },
      {
        title: "Volunteer with a local botanical garden or park service",
        detail:
          "Most public green space in a city is maintained by a small staff stretched thin — volunteer weeding, planting, and invasive-removal days are usually open to anyone.",
      },
    ],
  },
  {
    wave: 4,
    scale: "Your Country",
    tagline: "The scale where policy determines what's even possible",
    intro:
      "Entire ecosystems, endangered species protections, and national land-use policy operate at a scale no individual action replaces — but individual and collective pressure is exactly how that policy gets written and enforced.",
    actions: [
      {
        title: "Support national reforestation and afforestation programs",
        detail:
          "Large-scale tree-planting and forest-restoration programs (often run by national forestry departments or large NGOs) need both funding and public support to survive budget cycles.",
      },
      {
        title: "Support protection of national parks and biosphere reserves",
        detail:
          "Protected status isn't permanent — boundaries and protections get reconsidered, and public comment periods are often the only check on development pressure.",
      },
      {
        title: "Advocate against deforestation and unsustainable land conversion",
        detail:
          "Choosing products certified against driving deforestation (in palm oil, timber, and soy supply chains especially) adds market pressure that compounds with policy pressure.",
      },
      {
        title: "Support seed banks and botanical gardens doing ex-situ conservation",
        detail:
          "Species like the Venus Flytrap and Giant Sequoia — both featured in this encyclopedia — depend partly on seed banking and cultivated backup populations as insurance against habitat loss.",
      },
      {
        title: "Push for enforcement against illegal plant collection and trade",
        detail:
          "Wild poaching of rare species (the Venus Flytrap is a documented example) continues even where laws exist, because enforcement is underfunded — this is a policy and budget fight, not just a legal one.",
      },
      {
        title: "Support sustainable agriculture policy",
        detail:
          "National agricultural policy shapes whether farming practices protect or degrade soil and native flora at a scale no individual garden can offset — engaging with it (through advocacy groups, public comment, or voting) is a real lever.",
      },
      {
        title: "Engage with citizen-science and reporting programs",
        detail:
          "National invasive-species reporting apps and native-plant survey programs turn individual observations into the data that actually drives national conservation policy.",
      },
    ],
  },
];
