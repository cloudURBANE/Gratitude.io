// Smart review generator that creates unique, contextual reviews
interface ReviewTemplate {
  openings: string[];
  serviceQualities: string[];
  personalTouches: string[];
  recommendations: string[];
  closings: string[];
}

interface WorkerContext {
  name: string;
  role: string;
  location: string;
}

const reviewTemplates: Record<string, ReviewTemplate> = {
  // Restaurant/Food Service
  server: {
    openings: [
      "Had an amazing dining experience here!",
      "What a fantastic meal and service!",
      "Exceptional service from start to finish.",
      "Outstanding dining experience tonight.",
      "Really impressed with the service here."
    ],
    serviceQualities: [
      "was incredibly attentive and knowledgeable about the menu",
      "provided excellent recommendations and was very friendly",
      "made sure our table had everything we needed throughout the meal",
      "went above and beyond to make our experience special",
      "was professional, warm, and made great suggestions"
    ],
    personalTouches: [
      "They remembered my dietary restrictions without me having to remind them.",
      "Even during the busy dinner rush, they never made us feel rushed.",
      "They checked on us at just the right moments.",
      "Their enthusiasm for the food really showed.",
      "They made our celebration feel extra special."
    ],
    recommendations: [
      "Ask for their table - you won't be disappointed!",
      "Definitely request them as your server.",
      "They truly enhanced our entire dining experience.",
      "Made what could have been just a meal into a memorable experience.",
      "This is the kind of service that keeps customers coming back."
    ],
    closings: [
      "Will absolutely be back!",
      "Highly recommend this place!",
      "Can't wait to return!",
      "Five stars well deserved!",
      "Excellent all around!"
    ]
  },

  // Delivery Services
  driver: {
    openings: [
      "Fast and reliable delivery service!",
      "Great delivery experience today.",
      "Quick and professional delivery.",
      "Excellent delivery service!",
      "Really impressed with the delivery."
    ],
    serviceQualities: [
      "arrived right on time and was very courteous",
      "was quick, careful with the order, and very friendly",
      "handled everything professionally and with a smile",
      "was punctual and made sure everything was correct",
      "went the extra mile to ensure a smooth delivery"
    ],
    personalTouches: [
      "They called when they couldn't find parking to coordinate.",
      "Even followed special delivery instructions perfectly.",
      "They were careful with fragile items in the order.",
      "Arrived during bad weather but still maintained great attitude.",
      "They double-checked the order to make sure nothing was missing."
    ],
    recommendations: [
      "Hope to get them for future deliveries!",
      "This is how delivery service should be done.",
      "Sets a high standard for delivery drivers.",
      "Made the whole ordering experience seamless.",
      "Reliable service you can count on."
    ],
    closings: [
      "Will definitely order again!",
      "Highly recommend!",
      "Five stars for sure!",
      "Great service!",
      "Perfect delivery experience!"
    ]
  },

  // Personal Services
  barista: {
    openings: [
      "Perfect coffee and service this morning!",
      "Great start to my day here!",
      "Fantastic coffee and atmosphere.",
      "Love coming to this place!",
      "Consistently excellent coffee shop."
    ],
    serviceQualities: [
      "makes the perfect latte every single time",
      "is always friendly and remembers regular customers",
      "creates beautiful latte art and great conversation",
      "knows their coffee and gives excellent recommendations",
      "maintains the perfect balance of speed and quality"
    ],
    personalTouches: [
      "They remembered my usual order without me having to say anything.",
      "Always asks about my day and makes genuine conversation.",
      "They suggested a new drink that became my new favorite.",
      "Even during morning rush, they take time to get it right.",
      "Their positive energy really brightens my mornings."
    ],
    recommendations: [
      "This is my go-to coffee spot for a reason!",
      "They're what makes this place special.",
      "Consistently the best coffee experience in the area.",
      "Makes every visit feel personalized and special.",
      "The kind of service that builds loyal customers."
    ],
    closings: [
      "See you tomorrow morning!",
      "Keep up the excellent work!",
      "Five stars every time!",
      "Couldn't ask for better!",
      "My daily coffee ritual!"
    ]
  },

  // Default template for other roles
  default: {
    openings: [
      "Excellent service experience!",
      "Really impressed with the service today.",
      "Outstanding professional service.",
      "Great customer service experience.",
      "Very pleased with the service provided."
    ],
    serviceQualities: [
      "was professional, efficient, and very helpful",
      "provided excellent service with a friendly attitude",
      "went above and beyond to ensure satisfaction",
      "handled everything professionally and courteously",
      "delivered exactly what was needed with great care"
    ],
    personalTouches: [
      "They took the time to understand exactly what I needed.",
      "Their attention to detail really made a difference.",
      "They followed up to make sure everything was perfect.",
      "Even small details were handled with care.",
      "Their expertise and professionalism really showed."
    ],
    recommendations: [
      "Would definitely recommend their services!",
      "This is the level of service everyone should strive for.",
      "They truly care about customer satisfaction.",
      "Made the entire experience smooth and pleasant.",
      "The kind of professional you can rely on."
    ],
    closings: [
      "Will definitely use their services again!",
      "Highly recommend!",
      "Five stars well earned!",
      "Excellent all around!",
      "Great experience!"
    ]
  }
};

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function normalizeRole(role: string): string {
  const roleLower = role.toLowerCase();
  
  if (roleLower.includes('server') || roleLower.includes('waiter') || roleLower.includes('waitress')) return 'server';
  if (roleLower.includes('driver') || roleLower.includes('delivery')) return 'driver';
  if (roleLower.includes('barista') || roleLower.includes('coffee')) return 'barista';
  
  return 'default';
}

export function generateUniqueReview(worker: WorkerContext): string {
  const roleKey = normalizeRole(worker.role);
  const template = reviewTemplates[roleKey] || reviewTemplates.default;
  
  // Select random components
  const opening = getRandomItem(template.openings);
  const serviceQuality = getRandomItem(template.serviceQualities);
  const personalTouch = getRandomItem(template.personalTouches);
  const recommendation = getRandomItem(template.recommendations);
  const closing = getRandomItem(template.closings);
  
  // Construct the review
  const review = `${opening} ${worker.name} ${serviceQuality}. ${personalTouch} ${recommendation} ${closing}`;
  
  return review;
}

// Generate review URLs with pre-filled content
export function generateReviewUrls(worker: WorkerContext, businessName?: string) {
  const review = generateUniqueReview(worker);
  const encodedReview = encodeURIComponent(review);
  const businessQuery = businessName ? encodeURIComponent(businessName) : encodeURIComponent(`${worker.name} ${worker.location}`);
  
  return {
    google: `https://www.google.com/search?q=${businessQuery}+reviews#lrd=0x0:0x0,1,,,&rlimm=1`,
    yelp: `https://www.yelp.com/writeareview/biz/${businessQuery.toLowerCase().replace(/\s+/g, '-')}?review_text=${encodedReview}`,
    reviewText: review
  };
}