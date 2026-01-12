'use client'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Building2,
  Star,
  Wifi,
  Car,
  Coffee,
  Utensils,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronRight,
  Users,
  BedDouble,
  Shirt,
  Dumbbell,
  ShieldCheck,
  Heart,
  MessageCircle,
  ArrowRight,
  Instagram,
  Facebook,
  Twitter
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabaseClient"
import { Room } from "@/types"
import { formatCurrency } from "@/lib/utils"

interface ServiceItem {
  id: number
  name: string
  description: string
  price: number
  category: string
  is_available: boolean
}

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-5 w-5" />,
  parking: <Car className="h-5 w-5" />,
  restaurant: <Utensils className="h-5 w-5" />,
  spa: <Sparkles className="h-5 w-5" />,
  gym: <Dumbbell className="h-5 w-5" />,
  laundry: <Shirt className="h-5 w-5" />,
  coffee: <Coffee className="h-5 w-5" />,
  security: <ShieldCheck className="h-5 w-5" />,
}

const HOTEL_FEATURES = [
  { icon: <Building2 className="h-8 w-8" />, label: "Premium Rooms", value: "50+" },
  { icon: <Star className="h-8 w-8" />, label: "Guest Rating", value: "4.8" },
  { icon: <Users className="h-8 w-8" />, label: "Happy Guests", value: "10K+" },
  { icon: <Heart className="h-8 w-8" />, label: "Years of Service", value: "15+" },
]

const GALLERY_IMAGES = [
  { src: "/api/placeholder/600/400", alt: "Hotel Lobby", label: "Elegant Lobby" },
  { src: "/api/placeholder/600/400", alt: "Swimming Pool", label: "Infinity Pool" },
  { src: "/api/placeholder/600/400", alt: "Restaurant", label: "Fine Dining" },
  { src: "/api/placeholder/600/400", alt: "Spa", label: "Wellness Spa" },
  { src: "/api/placeholder/600/400", alt: "Garden", label: "Tropical Garden" },
  { src: "/api/placeholder/600/400", alt: "Meeting Room", label: "Conference Hall" },
]

export default function LandingPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [services, setServices] = useState<ServiceItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsResult, servicesResult] = await Promise.all([
          supabase
            .from('rooms')
            .select('*, custom_room_types(*)')
            .limit(6),
          supabase
            .from('service_items')
            .select('*')
            .eq('is_available', true)
            .limit(8)
        ])

        if (roomsResult.data) {
          setRooms(roomsResult.data as Room[])
        }
        if (servicesResult.data) {
          setServices(servicesResult.data as ServiceItem[])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen -m-4">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent" />

        {/* Animated Circles */}
        <motion.div
          className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 px-4 py-2 text-sm bg-primary/10 text-primary border-primary/20">
              ✨ Welcome to Luxury Living
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          >
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              StayManager
            </span>
            <br />
            <span className="text-foreground">Hotel & Resort</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            Experience unparalleled comfort and luxury in every stay.
            Your perfect getaway awaits.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button size="lg" className="text-lg px-8 py-6 rounded-full shadow-lg shadow-primary/25" asChild>
              <Link href="/chatbot">
                <MessageCircle className="mr-2 h-5 w-5" />
                Book Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-full" asChild>
              <Link href="#rooms">
                Explore Rooms
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-muted-foreground/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Features Strip */}
      <section className="py-12 bg-primary/5 border-y">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {HOTEL_FEATURES.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  {feature.icon}
                </div>
                <div className="text-3xl font-bold text-foreground">{feature.value}</div>
                <div className="text-muted-foreground">{feature.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <Badge className="mb-4">About Us</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            A Legacy of <span className="text-primary">Hospitality</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Nestled in the heart of the city, StayManager Hotel & Resort offers a perfect blend of
            modern luxury and timeless elegance. Our commitment to exceptional service has made us
            a preferred destination for travelers seeking comfort, convenience, and unforgettable experiences.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Wifi />, label: "Free WiFi" },
              { icon: <Car />, label: "Free Parking" },
              { icon: <Utensils />, label: "Restaurant" },
              { icon: <Sparkles />, label: "Spa & Wellness" },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50">
                <div className="text-primary">{item.icon}</div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4">Accommodations</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Our <span className="text-primary">Rooms & Suites</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from our carefully designed rooms, each offering unique comfort and style.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="h-48 bg-muted" />
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted rounded mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))
            ) : rooms.length > 0 ? (
              rooms.map((room, index) => (
                <motion.div key={room.id} variants={itemVariants}>
                  <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-card/80 backdrop-blur">
                    {/* Room Image Placeholder */}
                    <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
                      <BedDouble className="h-16 w-16 text-primary/40 group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-primary text-primary-foreground">
                          {formatCurrency(room.base_price || room.price)}/night
                        </Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Room {room.number}</span>
                        <Badge variant="outline" className="capitalize">
                          {room.type || room.custom_room_types?.name || 'Standard'}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {room.max_occupancy} Guests
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          Floor {room.floor}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(room.amenities || []).slice(0, 4).map((amenity, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                      <Button className="w-full" variant="outline" asChild>
                        <Link href="/chatbot">
                          Book This Room
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <BedDouble className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No rooms available at the moment.</p>
              </div>
            )}
          </motion.div>

          {rooms.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Button size="lg" asChild>
                <Link href="/chatbot">
                  View All Rooms
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4">Services</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Premium <span className="text-primary">Amenities</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enjoy our world-class services designed to make your stay exceptional.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {services.length > 0 ? (
            services.map((service, index) => (
              <motion.div key={service.id} variants={itemVariants}>
                <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-card to-muted/50">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4">
                    {service.category === 'food' ? <Utensils className="h-6 w-6" /> :
                      service.category === 'laundry' ? <Shirt className="h-6 w-6" /> :
                        service.category === 'wellness' ? <Sparkles className="h-6 w-6" /> :
                          service.category === 'transport' ? <Car className="h-6 w-6" /> :
                            <Coffee className="h-6 w-6" />}
                  </div>
                  <h3 className="font-semibold mb-1">{service.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                  <p className="text-primary font-bold mt-2">{formatCurrency(service.price)}</p>
                </Card>
              </motion.div>
            ))
          ) : (
            [
              { icon: <Wifi />, name: "High-Speed WiFi", desc: "Stay connected 24/7" },
              { icon: <Car />, name: "Valet Parking", desc: "Complimentary service" },
              { icon: <Utensils />, name: "Fine Dining", desc: "International cuisine" },
              { icon: <Sparkles />, name: "Spa & Wellness", desc: "Rejuvenate your soul" },
              { icon: <Dumbbell />, name: "Fitness Center", desc: "State-of-the-art equipment" },
              { icon: <Coffee />, name: "Room Service", desc: "24-hour availability" },
              { icon: <ShieldCheck />, name: "Security", desc: "24/7 surveillance" },
              { icon: <Shirt />, name: "Laundry", desc: "Express service available" },
            ].map((service, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-card to-muted/50">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4">
                    {service.icon}
                  </div>
                  <h3 className="font-semibold mb-1">{service.name}</h3>
                  <p className="text-sm text-muted-foreground">{service.desc}</p>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </section>

      {/* Gallery Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4">Gallery</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Explore Our <span className="text-primary">Facilities</span>
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {GALLERY_IMAGES.map((image, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative group overflow-hidden rounded-xl aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/5"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building2 className="h-12 w-12 text-primary/30" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="font-semibold">{image.label}</h3>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4">Contact Us</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Get in <span className="text-primary">Touch</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Have questions or need assistance? Our team is here to help you
              plan your perfect stay.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Address</h3>
                  <p className="text-muted-foreground">
                    123 Luxury Avenue, City Center<br />
                    Jakarta, Indonesia 12345
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Phone</h3>
                  <p className="text-muted-foreground">+62 21 1234 5678</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <p className="text-muted-foreground">info@staymanager.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Reception Hours</h3>
                  <p className="text-muted-foreground">24 Hours - We never close!</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-0">
              <h3 className="text-2xl font-bold mb-6">Quick Booking</h3>
              <p className="text-muted-foreground mb-6">
                Chat with our AI assistant to find the perfect room and make a reservation instantly.
              </p>
              <Button size="lg" className="w-full" asChild>
                <Link href="/chatbot">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Start Booking Chat
                </Link>
              </Button>
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground text-center">
                  Or call us directly at <strong>+62 21 1234 5678</strong>
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready for an Unforgettable Stay?
            </h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Book your room today and experience the luxury you deserve.
            </p>
            <Button size="lg" variant="secondary" className="text-lg px-10 py-6 rounded-full" asChild>
              <Link href="/chatbot">
                Book Your Stay Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-card border-t">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">StayManager</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Your home away from home. Experience luxury and comfort like never before.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#rooms" className="hover:text-primary transition-colors">Rooms</Link></li>
                <li><Link href="/guest-facilities" className="hover:text-primary transition-colors">Services</Link></li>
                <li><Link href="/chatbot" className="hover:text-primary transition-colors">Book Now</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/chatbot" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link href="/chatbot" className="hover:text-primary transition-colors">Contact Us</Link></li>
                <li><Link href="/chatbot" className="hover:text-primary transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} StayManager Hotel & Resort. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
