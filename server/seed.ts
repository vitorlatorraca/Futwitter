import { db } from "./db";
import { teams, users, journalists, players } from "@shared/schema";
import { TEAMS_DATA } from "./teams-data";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Starting database seed...");

  try {
    // Check if teams already exist
    const existingTeams = await db.select().from(teams);
    
    if (existingTeams.length === 0) {
      console.log("Seeding teams...");
      
      // Insert all 20 teams
      for (const team of TEAMS_DATA) {
        await db.insert(teams).values({
          id: team.id,
          name: team.name,
          shortName: team.shortName,
          logoUrl: team.logoUrl,
          primaryColor: team.primaryColor,
          secondaryColor: team.secondaryColor,
          currentPosition: Math.floor(Math.random() * 20) + 1, // Random position
          points: Math.floor(Math.random() * 50), // Random points
          wins: Math.floor(Math.random() * 15),
          draws: Math.floor(Math.random() * 10),
          losses: Math.floor(Math.random() * 10),
        });
      }
      
      console.log(`✓ Seeded ${TEAMS_DATA.length} teams`);
    } else {
      console.log("Teams already seeded, skipping...");
    }

    // Create a sample journalist user
    const existingJournalist = await db.select().from(users).where(eq(users.email, "jornalista@brasileirao.com"));
    
    if (existingJournalist.length === 0) {
      console.log("Creating sample journalist...");
      
      const hashedPassword = await bcrypt.hash("senha123", 10);
      
      const [journalistUser] = await db.insert(users).values({
        name: "Maria Silva",
        email: "jornalista@brasileirao.com",
        password: hashedPassword,
        teamId: "flamengo",
        userType: "JOURNALIST",
      }).returning();

      await db.insert(journalists).values({
        userId: journalistUser.id,
        organization: "Brasileirão News",
        bio: "Jornalista esportiva especializada em futebol brasileiro",
        verified: true,
        verificationStatus: "APPROVED",
      });

      console.log("✓ Created journalist user (email: jornalista@brasileirao.com, password: senha123)");
    } else {
      console.log("Journalist already exists, skipping...");
    }

    // Create sample fan user
    const existingFan = await db.select().from(users).where(eq(users.email, "torcedor@brasileirao.com"));
    
    if (existingFan.length === 0) {
      console.log("Creating sample fan user...");
      
      const hashedPassword = await bcrypt.hash("senha123", 10);
      
      await db.insert(users).values({
        name: "João Santos",
        email: "torcedor@brasileirao.com",
        password: hashedPassword,
        teamId: "palmeiras",
        userType: "FAN",
      });

      console.log("✓ Created fan user (email: torcedor@brasileirao.com, password: senha123)");
    } else {
      console.log("Fan user already exists, skipping...");
    }

    // Seed sample players for each team
    const existingPlayers = await db.select().from(players);
    
    if (existingPlayers.length === 0) {
      console.log("Seeding sample players...");
      
      const positions = ["GOALKEEPER", "DEFENDER", "MIDFIELDER", "FORWARD"] as const;
      
      for (const team of TEAMS_DATA.slice(0, 5)) { // Just first 5 teams for now
        // Add 11 players per team
        for (let i = 1; i <= 11; i++) {
          const position = positions[Math.floor(Math.random() * positions.length)];
          
          await db.insert(players).values({
            teamId: team.id,
            name: `Jogador ${i} - ${team.shortName}`,
            position,
            jerseyNumber: i,
          });
        }
      }
      
      console.log("✓ Seeded sample players for 5 teams");
    } else {
      console.log("Players already seeded, skipping...");
    }

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seed().then(() => {
  console.log("Seed complete!");
  process.exit(0);
}).catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
