import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  SafeAreaView
} from "react-native";

const OrganizationPage = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Manish",
      title: "CEO",
      email: "manish@example.com",
      avatar: "https://randomuser.me/api/portraits/men/71.jpg",
    },
    {
      id: 2,
      name: "Sunny",
      title: "CTO",
      email: "sunny@example.com",
      avatar: "https://randomuser.me/api/portraits/men/34.jpg",
    },
    {
      id: 3,
      name: "Kunal",
      title: "Head of Marketing",
      email: "kunal@example.com",
      avatar: "https://randomuser.me/api/portraits/men/87.jpg",
    },
    {
      id: 4,
      name: "Sahil",
      title: "Lead Designer",
      email: "sahil@example.com",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    },
    {
      id: 5,
      name: "Rohan",
      title: "Project Manager",
      email: "rohan@example.com",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    },
  ];

  const testimonials = [
    {
      id: 1,
      name: "Manisha Gaur",
      text: "TeachologyAI helps me to understand concepts.",
    },
    {
      id: 2,
      name: "Jatin Sharma",
      text: "Incredible service and a highly dedicated team!",
    },
    {
      id: 3,
      name: "Shubham Gill",
      text: "Top-notch service! Highly recommended for business growth.",
    },
  ];

  const services = [
    {
      id: 1,
      name: "Web Development",
      description: "Custom web applications, e-commerce solutions, and responsive websites.",
    },
    {
      id: 2,
      name: "AI Solutions",
      description: "Machine learning models, AI automation, and intelligent chatbots.",
    },
    {
      id: 3,
      name: "Digital Marketing",
      description: "SEO, social media management, and targeted ad campaigns.",
    },
  ];

  const projects = [
    {
      id: 1,
      name: "E-commerce Platform",
      description: "Built a high-performance online marketplace for a leading retail brand.",
    },
    {
      id: 2,
      name: "AI Chatbot",
      description: "Developed a chatbot for automated customer support with NLP capabilities.",
    },
    {
      id: 3,
      name: "Marketing Dashboard",
      description: "Created an analytics tool for tracking social media performance and sales data.",
    },
  ];
  
  const handleEmailPress = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.pageContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>TeachologyAI</Text>
          <Text style={styles.headerSubtitle}>Your trusted partner in education.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Us</Text>
          <Text style={styles.paragraph}>
            At TeachologyAI, we specialize in cutting-edge technology solutions
            that empower businesses to achieve their goals. Our expert team is
            dedicated to providing top-quality services that drive success. With
            over a decade of experience, we pride ourselves on innovation,
            creativity, and customer satisfaction.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          {services.map((service) => (
            <Text key={service.id} style={styles.listItem}>
              <Text style={styles.boldText}>{service.name}:</Text> {service.description}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meet Our Team</Text>
          <View style={styles.teamContainer}>
            {teamMembers.map((member) => (
              <View key={member.id} style={styles.teamMemberCard}>
                <Image source={{ uri: member.avatar }} style={styles.avatar} />
                <View style={styles.teamMemberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberTitle}>{member.title}</Text>
                  <TouchableOpacity onPress={() => handleEmailPress(member.email)}>
                    <Text style={styles.memberEmail}>{member.email}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Projects</Text>
          {projects.map((project) => (
            <Text key={project.id} style={styles.listItem}>
              <Text style={styles.boldText}>{project.name}:</Text> {project.description}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Our Clients Say</Text>
          {testimonials.map((testimonial) => (
            <View key={testimonial.id} style={styles.testimonial}>
              <Text style={styles.testimonialText}>"{testimonial.text}"</Text>
              <Text style={styles.testimonialName}>— {testimonial.name}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.paragraph}>Have questions? We'd love to hear from you!</Text>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => handleEmailPress('Contact@envisionaitech.com')}
          >
            <Text style={styles.contactButtonText}>Get in Touch</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  pageContainer: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#4a45e4',
    paddingVertical: 40,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginVertical: 10,
    width: '100%',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#1a202c',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#555e6d',
  },
  listItem: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555e6d',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#1a202c',
  },
  teamContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  teamMemberCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    margin: 10,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    width: 250,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  teamMemberInfo: {
    alignItems: 'center',
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  memberTitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  memberEmail: {
    fontSize: 12,
    color: '#007bff',
  },
  testimonial: {
    marginBottom: 15,
    alignItems: 'center',
  },
  testimonialText: {
    fontStyle: 'italic',
    fontSize: 16,
    textAlign: 'center',
    color: '#555e6d',
  },
  testimonialName: {
    marginTop: 5,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  contactButton: {
      backgroundColor: '#4a45e4',
      paddingVertical: 12,
      paddingHorizontal: 25,
      borderRadius: 8,
      marginTop: 15,
      alignSelf: 'center',
  },
  contactButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
  },
});

export default OrganizationPage;