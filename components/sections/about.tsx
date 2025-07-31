"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Octokit } from "@octokit/rest";
import {
  EnhancedStatsCard,
  SpecialStatsCard,
} from "@/components/ui/enhanced_card_stats";
import { Code2, GitCommit, FileText, Trophy, BookOpen } from "lucide-react";

interface GitHubStats {
  totalRepos: number;
  totalCommits: number;
  totalLinesOfCode: number;
  leetcodeSolved: number;
  loading: boolean;
}

interface GraphQLResponse {
  user: {
    contributionsCollection: {
      totalCommitContributions: number;
    };
  };
}

export function AboutSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Parallax transforms for background layers
  // const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  // const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"])
  // const y3 = useTransform(scrollYProgress, [0, 1], ["0%", "25%"])

  const [githubStats, setGithubStats] = useState<GitHubStats>({
    totalRepos: 0,
    totalCommits: 0,
    totalLinesOfCode: 0,
    leetcodeSolved: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchGitHubStats = async () => {
      try {
        const octokit = new Octokit({
          auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN,
        });

        // Get all public repositories
        const { data: repos } = await octokit.rest.repos.listForUser({
          username: "vedantkesharia",
          per_page: 100,
        });

        // Calculate total lines of code (approximation using language stats)
        let totalLinesOfCode = 0;

        const languagePromises = repos.slice(0, 15).map(async (repo) => {
          try {
            const { data: languages } = await octokit.rest.repos.listLanguages({
              owner: "vedantkesharia",
              repo: repo.name,
            });

            // Sum up bytes of code (rough approximation)
            return Object.values(languages).reduce(
              (sum: number, bytes) => sum + (bytes as number),
              0
            );
          } catch (error) {
            console.log(`Could not fetch languages for ${repo.name}:`, error);
            return 0;
          }
        });

        const languageCounts = await Promise.all(languagePromises);
        const totalBytes = languageCounts.reduce(
          (sum, count) => sum + count,
          0
        );

        // Convert bytes to approximate lines (average ~50 characters per line)
        totalLinesOfCode = Math.floor(totalBytes / 50);

        // Get total commits using direct repo scanning for maximum accuracy
        let totalCommits = 0;

        try {
          // Method 1: Get contributions from GraphQL (for baseline)
          const currentYear = new Date().getFullYear();
          const startYear = 2019;

          let graphqlTotal = 0;

          for (let year = startYear; year <= currentYear; year++) {
            try {
              const contributionsQuery = `
                query($username: String!, $from: DateTime!, $to: DateTime!) {
                  user(login: $username) {
                    contributionsCollection(from: $from, to: $to) {
                      totalCommitContributions
                    }
                  }
                }
              `;

              const contributionsResult =
                await octokit.graphql<GraphQLResponse>(contributionsQuery, {
                  username: "vedantkesharia",
                  from: `${year}-01-01T00:00:00Z`,
                  to: `${year}-12-31T23:59:59Z`,
                });

              graphqlTotal +=
                contributionsResult.user.contributionsCollection
                  .totalCommitContributions;
            } catch (yearError) {
              console.log(`Failed to get commits for year ${year}:`, yearError);
            }
          }

          // Method 2: Manual count from repositories (more accurate)
          let manualTotal = 0;

          // Get all repos including private ones if token has access
          const allRepos = await octokit.paginate(
            octokit.rest.repos.listForUser,
            {
              username: "vedantkesharia",
              type: "all", // includes private repos
              per_page: 100,
            }
          );

          console.log(`Found ${allRepos.length} total repositories`);

          // Count commits from each repo (limit to avoid rate limits)
          const commitPromises = allRepos.map(async (repo) => {
            try {
              // Get total commit count using different approach
              const commits = await octokit.paginate(
                octokit.rest.repos.listCommits,
                {
                  owner: "vedantkesharia",
                  repo: repo.name,
                  author: "vedantkesharia",
                  per_page: 100,
                },
                (response) => response.data
              );

              console.log(`${repo.name}: ${commits.length} commits`);
              return commits.length;
            } catch (error) {
              // If we can't access repo, try without author filter
              try {
                const { data: commits } = await octokit.rest.repos.listCommits({
                  owner: "vedantkesharia",
                  repo: repo.name,
                  per_page: 100,
                });

                // Filter commits by author manually
                const myCommits = commits.filter(
                  (commit) =>
                    commit.author?.login === "vedantkesharia" ||
                    commit.commit.author?.email?.includes("vedant") // adjust email pattern
                );

                console.log(
                  `${repo.name}: ${myCommits.length} commits (filtered)`
                );
                return myCommits.length;
              } catch (innerError) {
                console.log(`Could not access ${repo.name}:`, innerError);
                return 0;
              }
            }
          });

          const commitCounts = await Promise.all(commitPromises);
          manualTotal = commitCounts.reduce((sum, count) => sum + count, 0);

          console.log(`GraphQL total: ${graphqlTotal}`);
          console.log(`Manual count total: ${manualTotal}`);

          // Use the higher count and add a small buffer for missed commits
          totalCommits = Math.max(graphqlTotal, manualTotal);

          // If still seems low, add estimated buffer for private/missed commits
          if (totalCommits < 700) {
            totalCommits = Math.floor(totalCommits * 1.1); // Add 10% buffer
            console.log(`Applied buffer, final count: ${totalCommits}`);
          }
        } catch (error) {
          console.log("GraphQL failed, falling back to REST API estimation");

          // Fallback: Get commits from more repos but with pagination
          const commitPromises = repos.slice(0, 20).map(async (repo) => {
            try {
              // Get first page to check total count
              const { data: commits } = await octokit.rest.repos.listCommits({
                owner: "vedantkesharia",
                repo: repo.name,
                author: "vedantkesharia",
                per_page: 1,
              });

              // Estimate total commits (this is still limited by API)
              if (commits.length > 0) {
                // Try to get a better estimate by checking commit history
                const { data: allCommits } =
                  await octokit.rest.repos.listCommits({
                    owner: "vedantkesharia",
                    repo: repo.name,
                    author: "vedantkesharia",
                    per_page: 100,
                  });
                return allCommits.length;
              }
              return 0;
            } catch (error) {
              console.log(`Could not fetch commits for ${repo.name}:`, error);
              return 0;
            }
          });

          const commitCounts = await Promise.all(commitPromises);
          totalCommits = commitCounts.reduce((sum, count) => sum + count, 0);

          // Add estimation multiplier since we're likely undercounting
          totalCommits = Math.floor(totalCommits * 1.5); // Conservative estimate
        }

        // Fetch LeetCode stats
        let leetcodeSolved = 0;
        try {
          const leetcodeResponse = await fetch(
            "https://leetcode-stats-api.herokuapp.com/keshariavedant"
          );
          if (leetcodeResponse.ok) {
            const leetcodeData = await leetcodeResponse.json();
            leetcodeSolved = leetcodeData.totalSolved || 0;
          }
        } catch (error) {
          console.log("LeetCode API failed:", error);
          leetcodeSolved = 150; // Fallback value
        }

        setGithubStats({
          totalRepos: repos.length,
          totalCommits,
          totalLinesOfCode,
          leetcodeSolved,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching GitHub stats:", error);
        // Fallback to mock data if API fails
        setGithubStats({
          totalRepos: 42,
          totalCommits: 1250,
          totalLinesOfCode: 50000,
          leetcodeSolved: 150,
          loading: false,
        });
      }
    };

    fetchGitHubStats();
  }, []);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section ref={ref} id="about" className="py-32 relative overflow-hidden">
      {/* Animated Background Effects */}
      {/* <div className="absolute inset-0">
        <Meteors number={30} />
        <ShootingStars 
          minSpeed={15}
          maxSpeed={35}
          minDelay={800}
          maxDelay={3000}
          starColor="#ffffff"
          trailColor="#6366f1"
        />
      </div> */}

      {/* Parallax Background Layers */}
      {/* <motion.div
        style={{ y: y1 }}
        className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-black/40 will-change-transform"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute inset-0 bg-gradient-to-tl from-gray-800/10 to-gray-900/20 will-change-transform"
      />
      <motion.div
        style={{ y: y3 }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-900/10 to-transparent will-change-transform"
      /> */}

      {/* Base background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/50 to-black" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-6xl font-light mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            About Me
          </h2>
          <div className="w-64 h-px bg-gradient-to-r from-transparent via-white to-transparent mx-auto" />
        </motion.div>

        {/* About Me Text - Enhanced Typography */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-5xl mx-auto mb-20"
        >
          <div className="relative">
            {/* Elegant Typography Container */}
            <div className="bg-gradient-to-br from-gray-900/30 to-gray-800/20 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-12 relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-x-16 -translate-y-16" />
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-white/3 to-transparent rounded-full translate-x-12 translate-y-12" />

              {/* Quote Mark */}
              <div className="absolute top-8 left-8 text-8xl text-white/5 font-serif leading-none">
                "
              </div>

              <div className="relative z-10 space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-3xl md:text-4xl font-light text-white leading-relaxed tracking-wide text-center"
                >
                  I'm a passionate{" "}
                  <span className="relative">
                    <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent font-medium">
                      Full-Stack AI Engineer
                    </span>
                    <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  </span>{" "}
                  pursuing my Master's in Computer Science at{" "}
                  <span className="text-white font-medium">
                    University of Colorado Boulder
                  </span>
                  .
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  whileInView={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="w-32 h-px bg-gradient-to-r from-white/50 to-transparent mx-auto"
                />

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="text-xl text-gray-300 leading-relaxed font-light text-center max-w-4xl mx-auto"
                >
                  I specialize in building intelligent systems that bridge the
                  gap between cutting-edge AI research and practical
                  applications, with a focus on creating meaningful impact
                  through technology.
                </motion.div>

                {/* Elegant CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.0 }}
                  className="flex flex-col sm:flex-row gap-6 justify-center pt-8"
                >
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative px-10 py-4 bg-white text-black font-medium overflow-hidden transition-all duration-300 rounded-sm"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* <span className="relative z-10 tracking-wide">
                      Download Resume
                    </span> */}
                    <button
                      onClick={() =>
                        window.open(
                          "https://drive.google.com/file/d/19bceCdlZaAh3l5y6ir7KcwaKkutvaxD6/view?usp=sharing",
                          "_blank"
                        )
                      }
                    >
                      <span className="relative z-10 tracking-wide">
                        Download Resume
                      </span>
                    </button>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => scrollToSection("contact")}
                    className="group relative px-10 py-4 border border-gray-600 text-gray-300 overflow-hidden transition-all duration-300 rounded-sm hover:border-white hover:text-white"
                  >
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10 tracking-wide">
                      Let's Connect
                    </span>
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Development Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-20"
        >
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-3xl font-medium text-center text-gray-300 mb-12"
          >
            Development Stats
          </motion.h3>

          {/* Stats Grid - 2x2 layout on larger screens, stacked on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <EnhancedStatsCard
              value={githubStats.loading ? "..." : githubStats.totalRepos}
              label="GitHub Repos"
              icon={<Code2 className="w-6 h-6" />}
              delay={0.7}
              isLoading={githubStats.loading}
            />

            <EnhancedStatsCard
              value={
                githubStats.loading ? "..." : `${githubStats.totalCommits}+`
              }
              label="Total Commits"
              icon={<GitCommit className="w-6 h-6" />}
              delay={0.8}
              isLoading={githubStats.loading}
            />

            <EnhancedStatsCard
              value={
                githubStats.loading
                  ? "..."
                  : `${Math.floor(githubStats.totalLinesOfCode / 1000)}K`
              }
              label="Lines of Code"
              icon={<FileText className="w-6 h-6" />}
              delay={0.9}
              isLoading={githubStats.loading}
            />

            <EnhancedStatsCard
              value={githubStats.loading ? "..." : githubStats.leetcodeSolved}
              label="LeetCode Solved"
              icon={<Trophy className="w-6 h-6" />}
              delay={1.0}
              isLoading={githubStats.loading}
            />
          </div>
        </motion.div>

        {/* Research Papers - Special Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="max-w-md mx-auto mb-20"
        >
          <SpecialStatsCard
            value="8"
            label="Research Papers Published"
            icon={<BookOpen className="w-8 h-8" />}
            delay={1.3}
            isLoading={false}
          />
        </motion.div>

        {/* Background Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mt-24"
        >
          <div className="max-w-5xl mx-auto">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.5 }}
              className="text-2xl font-medium text-gray-300 mb-12 text-center"
            >
              Background
            </motion.h3>

            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/10 to-gray-800/5"></div>

            <div className="relative z-10 p-8">
              <div className="space-y-4 max-w-3xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                  className="group relative"
                >
                  <div className="relative px-6 py-5 rounded-xl hover:bg-gray-900/30 transition-all duration-300 overflow-hidden border border-gray-800/50 hover:border-gray-700/50">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gray-700 to-gray-800 group-hover:from-gray-600 group-hover:to-gray-700 transition-all duration-300"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative z-10 pl-4 flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-white mb-3 group-hover:text-gray-100 transition-colors">
                          Education
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-white/60"></div>
                            <p className="text-gray-300 text-sm font-medium">
                              MS Computer Science • University of Colorado
                              Boulder
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-white/40"></div>
                            <p className="text-gray-400 text-sm">
                              BTech IT • DJ Sanghvi College • 8.52 CGPA
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-gray-600 group-hover:text-gray-500 transition-colors">
                        {/* <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg> */}
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                  className="group relative"
                >
                  <div className="relative px-6 py-5 rounded-xl hover:bg-gray-900/30 transition-all duration-300 overflow-hidden border border-gray-800/50 hover:border-gray-700/50">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gray-700 to-gray-800 group-hover:from-gray-600 group-hover:to-gray-700 transition-all duration-300"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative z-10 pl-4 flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-white mb-3 group-hover:text-gray-100 transition-colors">
                          Research
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-white/60"></div>
                            <p className="text-gray-300 text-sm font-medium">
                              8 Published Papers • International Journals
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-white/40"></div>
                            <p className="text-gray-400 text-sm">
                              Patent Applied • ML Scheduling Algorithms
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-gray-600 group-hover:text-gray-500 transition-colors">
                        {/* <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg> */}
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.3 }}
                  className="group relative"
                >
                  <div className="relative px-6 py-5 rounded-xl hover:bg-gray-900/30 transition-all duration-300 overflow-hidden border border-gray-800/50 hover:border-gray-700/50">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gray-700 to-gray-800 group-hover:from-gray-600 group-hover:to-gray-700 transition-all duration-300"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative z-10 pl-4 flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-white mb-3 group-hover:text-gray-100 transition-colors">
                          Leadership
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-white/60"></div>
                            <p className="text-gray-300 text-sm font-medium">
                              Vice Chairperson • DJ Init.AI Club
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-white/40"></div>
                            <p className="text-gray-400 text-sm">
                              Research Intern • USC & IIT Patna
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-gray-600 group-hover:text-gray-500 transition-colors">
                        {/* <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg> */}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Accent */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1, delay: 1.9 }}
          className="mt-20 pt-12 border-t border-gray-800"
        >
          <div className="text-center">
            <p className="text-sm text-gray-500 uppercase tracking-widest">
              Building the future with AI & Innovation
            </p>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes meteor-effect {
          to {
            transform: rotate(215deg) translateX(200px);
            opacity: 0;
          }
        }

        @keyframes shootingStar {
          to {
            transform: rotate(var(--angle)) translateX(300px)
              scale(var(--scale));
            opacity: 0;
          }
        }

        .animate-meteor-effect {
          animation: meteor-effect linear infinite;
        }
      `}</style>
    </section>
  );
}

// "use client"
// import { motion, useScroll, useTransform } from "framer-motion"
// import { useEffect, useState, useRef } from "react"
// import { Octokit } from "@octokit/rest"
// import { EnhancedStatsCard, SpecialStatsCard } from "@/components/ui/enhanced_card_stats"
// import { Code2, GitCommit, FileText, Trophy, BookOpen } from "lucide-react"

// // Meteors Component (Aceternity UI)
// // const Meteors = ({ number = 20 }) => {
// //   const meteors = new Array(number).fill(true)
// //   return (
// //     <>
// //       {meteors.map((el, idx) => (
// //         <span
// //           key={"meteor" + idx}
// //           className={`animate-meteor-effect absolute top-1/2 left-1/2 h-0.5 w-0.5 rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-[215deg]`}
// //           style={{
// //             top: 0,
// //             left: Math.floor(Math.random() * (400 - -400) + -400) + "px",
// //             animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + "s",
// //             animationDuration: Math.floor(Math.random() * (10 - 2) + 2) + "s",
// //           }}
// //         >
// //           <div className="pointer-events-none absolute top-1/2 left-1/2 h-[1px] w-[50px] -translate-y-1/2 -translate-x-1/2 rotate-90 bg-gradient-to-r from-transparent to-slate-500" />
// //         </span>
// //       ))}
// //     </>
// //   )
// // }

// // // Shooting Stars Component (Aceternity UI)
// // interface Star {
// //   id: number
// //   x: number
// //   y: number
// //   angle: number
// //   scale: number
// //   speed: number
// //   distance: number
// // }

// // const ShootingStars = ({ minSpeed = 10, maxSpeed = 30, minDelay = 1200, maxDelay = 4200, starColor = "#9E00FF", trailColor = "#2EB9DF", starWidth = 10, starHeight = 1 }) => {
// //   const [stars, setStars] = useState<Star[]>([])

// //   useEffect(() => {
// //     const createStar = () => ({
// //       id: Date.now(),
// //       x: Math.random() * window.innerWidth,
// //       y: Math.random() * window.innerHeight,
// //       angle: Math.random() * 360,
// //       scale: Math.random() * 1 + 0.3,
// //       speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
// //       distance: Math.random() * 200 + 50,
// //     })

// //     const addStar = () => {
// //       setStars((currentStars) => [...currentStars.slice(-20), createStar()])
// //     }

// //     const interval = setInterval(addStar, Math.random() * (maxDelay - minDelay) + minDelay)
// //     return () => clearInterval(interval)
// //   }, [minSpeed, maxSpeed, minDelay, maxDelay])

// //   return (
// //     <div className="absolute inset-0 overflow-hidden">
// //       {stars.map((star) => (
// //         <div
// //           key={star.id}
// //           className="absolute rounded-full opacity-75"
// //           style={{
// //             left: star.x,
// //             top: star.y,
// //             transform: `rotate(${star.angle}deg) scale(${star.scale})`,
// //             width: starWidth,
// //             height: starHeight,
// //             background: `linear-gradient(90deg, ${starColor}, transparent)`,
// //             animation: `shootingStar 3s linear forwards`,
// //           }}
// //         >
// //           <div
// //             className="absolute rounded-full opacity-50"
// //             style={{
// //               width: star.distance,
// //               height: starHeight,
// //               background: `linear-gradient(90deg, ${trailColor}, transparent)`,
// //               transform: 'translateX(-100%)',
// //             }}
// //           />
// //         </div>
// //       ))}
// //     </div>
// //   )
// // }

// interface GitHubStats {
//   totalRepos: number
//   totalCommits: number
//   totalLinesOfCode: number
//   leetcodeSolved: number
//   loading: boolean
// }

// interface GraphQLResponse {
//   user: {
//     contributionsCollection: {
//       totalCommitContributions: number
//     }
//   }
// }

// export function AboutSection() {
//   const ref = useRef<HTMLDivElement>(null)
//   const { scrollYProgress } = useScroll({
//     target: ref,
//     offset: ["start end", "end start"],
//   })

//   // Parallax transforms for background layers
//   const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
//   const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"])
//   const y3 = useTransform(scrollYProgress, [0, 1], ["0%", "25%"])

//   const [githubStats, setGithubStats] = useState<GitHubStats>({
//     totalRepos: 0,
//     totalCommits: 0,
//     totalLinesOfCode: 0,
//     leetcodeSolved: 0,
//     loading: true,
//   })

//   useEffect(() => {
//     const fetchGitHubStats = async () => {
//       try {
//         const octokit = new Octokit({
//           auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN,
//         })

//         // Get all public repositories
//         const { data: repos } = await octokit.rest.repos.listForUser({
//           username: "vedantkesharia",
//           per_page: 100,
//         })

//         // Calculate total lines of code (approximation using language stats)
//         let totalLinesOfCode = 0

//         const languagePromises = repos.slice(0, 15).map(async (repo) => {
//           try {
//             const { data: languages } = await octokit.rest.repos.listLanguages({
//               owner: "vedantkesharia",
//               repo: repo.name,
//             })

//             // Sum up bytes of code (rough approximation)
//             return Object.values(languages).reduce((sum: number, bytes) => sum + (bytes as number), 0)
//           } catch (error) {
//             console.log(`Could not fetch languages for ${repo.name}:`, error)
//             return 0
//           }
//         })

//         const languageCounts = await Promise.all(languagePromises)
//         const totalBytes = languageCounts.reduce((sum, count) => sum + count, 0)

//         // Convert bytes to approximate lines (average ~50 characters per line)
//         totalLinesOfCode = Math.floor(totalBytes / 50)

//         // Get total commits using direct repo scanning for maximum accuracy
//         let totalCommits = 0

//         try {
//           // Method 1: Get contributions from GraphQL (for baseline)
//           const currentYear = new Date().getFullYear()
//           const startYear = 2019

//           let graphqlTotal = 0

//           for (let year = startYear; year <= currentYear; year++) {
//             try {
//               const contributionsQuery = `
//                 query($username: String!, $from: DateTime!, $to: DateTime!) {
//                   user(login: $username) {
//                     contributionsCollection(from: $from, to: $to) {
//                       totalCommitContributions
//                     }
//                   }
//                 }
//               `

//               const contributionsResult = await octokit.graphql<GraphQLResponse>(contributionsQuery, {
//                 username: "vedantkesharia",
//                 from: `${year}-01-01T00:00:00Z`,
//                 to: `${year}-12-31T23:59:59Z`,
//               })

//               graphqlTotal += contributionsResult.user.contributionsCollection.totalCommitContributions
//             } catch (yearError) {
//               console.log(`Failed to get commits for year ${year}:`, yearError)
//             }
//           }

//           // Method 2: Manual count from repositories (more accurate)
//           let manualTotal = 0

//           // Get all repos including private ones if token has access
//           const allRepos = await octokit.paginate(octokit.rest.repos.listForUser, {
//             username: "vedantkesharia",
//             type: "all", // includes private repos
//             per_page: 100,
//           })

//           console.log(`Found ${allRepos.length} total repositories`)

//           // Count commits from each repo (limit to avoid rate limits)
//           const commitPromises = allRepos.map(async (repo) => {
//             try {
//               // Get total commit count using different approach
//               const commits = await octokit.paginate(
//                 octokit.rest.repos.listCommits,
//                 {
//                   owner: "vedantkesharia",
//                   repo: repo.name,
//                   author: "vedantkesharia",
//                   per_page: 100,
//                 },
//                 (response) => response.data,
//               )

//               console.log(`${repo.name}: ${commits.length} commits`)
//               return commits.length
//             } catch (error) {
//               // If we can't access repo, try without author filter
//               try {
//                 const { data: commits } = await octokit.rest.repos.listCommits({
//                   owner: "vedantkesharia",
//                   repo: repo.name,
//                   per_page: 100,
//                 })

//                 // Filter commits by author manually
//                 const myCommits = commits.filter(
//                   (commit) =>
//                     commit.author?.login === "vedantkesharia" || commit.commit.author?.email?.includes("vedant"), // adjust email pattern
//                 )

//                 console.log(`${repo.name}: ${myCommits.length} commits (filtered)`)
//                 return myCommits.length
//               } catch (innerError) {
//                 console.log(`Could not access ${repo.name}:`, innerError)
//                 return 0
//               }
//             }
//           })

//           const commitCounts = await Promise.all(commitPromises)
//           manualTotal = commitCounts.reduce((sum, count) => sum + count, 0)

//           console.log(`GraphQL total: ${graphqlTotal}`)
//           console.log(`Manual count total: ${manualTotal}`)

//           // Use the higher count and add a small buffer for missed commits
//           totalCommits = Math.max(graphqlTotal, manualTotal)

//           // If still seems low, add estimated buffer for private/missed commits
//           if (totalCommits < 700) {
//             totalCommits = Math.floor(totalCommits * 1.1) // Add 10% buffer
//             console.log(`Applied buffer, final count: ${totalCommits}`)
//           }
//         } catch (error) {
//           console.log("GraphQL failed, falling back to REST API estimation")

//           // Fallback: Get commits from more repos but with pagination
//           const commitPromises = repos.slice(0, 20).map(async (repo) => {
//             try {
//               // Get first page to check total count
//               const { data: commits } = await octokit.rest.repos.listCommits({
//                 owner: "vedantkesharia",
//                 repo: repo.name,
//                 author: "vedantkesharia",
//                 per_page: 1,
//               })

//               // Estimate total commits (this is still limited by API)
//               if (commits.length > 0) {
//                 // Try to get a better estimate by checking commit history
//                 const { data: allCommits } = await octokit.rest.repos.listCommits({
//                   owner: "vedantkesharia",
//                   repo: repo.name,
//                   author: "vedantkesharia",
//                   per_page: 100,
//                 })
//                 return allCommits.length
//               }
//               return 0
//             } catch (error) {
//               console.log(`Could not fetch commits for ${repo.name}:`, error)
//               return 0
//             }
//           })

//           const commitCounts = await Promise.all(commitPromises)
//           totalCommits = commitCounts.reduce((sum, count) => sum + count, 0)

//           // Add estimation multiplier since we're likely undercounting
//           totalCommits = Math.floor(totalCommits * 1.5) // Conservative estimate
//         }

//         // Fetch LeetCode stats
//         let leetcodeSolved = 0
//         try {
//           const leetcodeResponse = await fetch("https://leetcode-stats-api.herokuapp.com/keshariavedant")
//           if (leetcodeResponse.ok) {
//             const leetcodeData = await leetcodeResponse.json()
//             leetcodeSolved = leetcodeData.totalSolved || 0
//           }
//         } catch (error) {
//           console.log("LeetCode API failed:", error)
//           leetcodeSolved = 150 // Fallback value
//         }

//         setGithubStats({
//           totalRepos: repos.length,
//           totalCommits,
//           totalLinesOfCode,
//           leetcodeSolved,
//           loading: false,
//         })
//       } catch (error) {
//         console.error("Error fetching GitHub stats:", error)
//         // Fallback to mock data if API fails
//         setGithubStats({
//           totalRepos: 42,
//           totalCommits: 1250,
//           totalLinesOfCode: 50000,
//           leetcodeSolved: 150,
//           loading: false,
//         })
//       }
//     }

//     fetchGitHubStats()
//   }, [])

//   const scrollToSection = (sectionId: string) => {
//     document.getElementById(sectionId)?.scrollIntoView({
//       behavior: "smooth",
//       block: "start",
//     })
//   }

//   return (
//     <section ref={ref} id="about" className="py-32 relative overflow-hidden">
//       {/* Animated Background Effects */}
//       {/* <div className="absolute inset-0">
//         <Meteors number={30} />
//         <ShootingStars
//           minSpeed={15}
//           maxSpeed={35}
//           minDelay={800}
//           maxDelay={3000}
//           starColor="#ffffff"
//           trailColor="#6366f1"
//         />
//       </div> */}

//       {/* Parallax Background Layers */}
//       <motion.div
//         style={{ y: y1 }}
//         className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-black/40 will-change-transform"
//       />
//       <motion.div
//         style={{ y: y2 }}
//         className="absolute inset-0 bg-gradient-to-tl from-gray-800/10 to-gray-900/20 will-change-transform"
//       />
//       <motion.div
//         style={{ y: y3 }}
//         className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-900/10 to-transparent will-change-transform"
//       />

//       {/* Base background gradient */}
//       <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/50 to-black" />

//       <div className="max-w-7xl mx-auto px-6 relative z-10">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           className="text-center mb-20"
//         >
//           <h2 className="text-6xl font-light mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
//             About Me
//           </h2>
//           <div className="w-64 h-px bg-gradient-to-r from-transparent via-white to-transparent mx-auto" />
//         </motion.div>

//         {/* About Me Text - Enhanced Typography */}
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8, delay: 0.2 }}
//           className="max-w-5xl mx-auto mb-20"
//         >
//           <div className="relative">
//             {/* Elegant Typography Container */}
//             <div className="bg-gradient-to-br from-gray-900/30 to-gray-800/20 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-12 relative overflow-hidden">
//               {/* Decorative Elements */}
//               <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-x-16 -translate-y-16" />
//               <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-white/3 to-transparent rounded-full translate-x-12 translate-y-12" />

//               {/* Quote Mark */}
//               <div className="absolute top-8 left-8 text-8xl text-white/5 font-serif leading-none">"</div>

//               <div className="relative z-10 space-y-8">
//                 <motion.p
//                   initial={{ opacity: 0, y: 20 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.8, delay: 0.4 }}
//                   className="text-3xl md:text-4xl font-light text-white leading-relaxed tracking-wide text-center"
//                 >
//                   I'm a passionate{" "}
//                   <span className="relative">
//                     <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent font-medium">
//                       Full-Stack AI Engineer
//                     </span>
//                     <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
//                   </span>{" "}
//                   pursuing my Master's in Computer Science at{" "}
//                   <span className="text-white font-medium">University of Colorado Boulder</span>.
//                 </motion.p>

//                 <motion.div
//                   initial={{ opacity: 0, scaleX: 0 }}
//                   whileInView={{ opacity: 1, scaleX: 1 }}
//                   transition={{ duration: 1, delay: 0.6 }}
//                   className="w-32 h-px bg-gradient-to-r from-white/50 to-transparent mx-auto"
//                 />

//                 <motion.p
//                   initial={{ opacity: 0, y: 20 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.8, delay: 0.8 }}
//                   className="text-xl text-gray-300 leading-relaxed font-light text-center max-w-4xl mx-auto"
//                 >
//                   I specialize in building intelligent systems that bridge the gap between cutting-edge AI research and
//                   practical applications, with a focus on creating meaningful impact through technology.
//                 </motion.p>

//                 {/* Elegant CTA Buttons */}
//                 <motion.div
//                   initial={{ opacity: 0, y: 20 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.8, delay: 1.0 }}
//                   className="flex flex-col sm:flex-row gap-6 justify-center pt-8"
//                 >
//                   <motion.button
//                     whileHover={{ scale: 1.02, y: -2 }}
//                     whileTap={{ scale: 0.98 }}
//                     className="group relative px-10 py-4 bg-white text-black font-medium overflow-hidden transition-all duration-300 rounded-sm"
//                   >
//                     <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                     <span className="relative z-10 tracking-wide">Download Resume</span>
//                   </motion.button>

//                   <motion.button
//                     whileHover={{ scale: 1.02, y: -2 }}
//                     whileTap={{ scale: 0.98 }}
//                     onClick={() => scrollToSection("contact")}
//                     className="group relative px-10 py-4 border border-gray-600 text-gray-300 overflow-hidden transition-all duration-300 rounded-sm hover:border-white hover:text-white"
//                   >
//                     <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                     <span className="relative z-10 tracking-wide">Let's Connect</span>
//                   </motion.button>
//                 </motion.div>
//               </div>
//             </div>
//           </div>
//         </motion.div>

//         {/* Development Stats Grid */}
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8, delay: 0.4 }}
//           className="mb-20"
//         >
//           <motion.h3
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6, delay: 0.6 }}
//             className="text-3xl font-medium text-center text-gray-300 mb-12"
//           >
//             Development Stats
//           </motion.h3>

//           {/* Stats Grid - 2x2 layout on larger screens, stacked on mobile */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
//             <EnhancedStatsCard
//               value={githubStats.loading ? "..." : githubStats.totalRepos}
//               label="GitHub Repos"
//               icon={<Code2 className="w-6 h-6" />}
//               delay={0.7}
//               isLoading={githubStats.loading}
//             />

//             <EnhancedStatsCard
//               value={githubStats.loading ? "..." : `${githubStats.totalCommits}+`}
//               label="Total Commits"
//               icon={<GitCommit className="w-6 h-6" />}
//               delay={0.8}
//               isLoading={githubStats.loading}
//             />

//             <EnhancedStatsCard
//               value={githubStats.loading ? "..." : `${Math.floor(githubStats.totalLinesOfCode / 1000)}K`}
//               label="Lines of Code"
//               icon={<FileText className="w-6 h-6" />}
//               delay={0.9}
//               isLoading={githubStats.loading}
//             />

//             <EnhancedStatsCard
//               value={githubStats.loading ? "..." : githubStats.leetcodeSolved}
//               label="LeetCode Solved"
//               icon={<Trophy className="w-6 h-6" />}
//               delay={1.0}
//               isLoading={githubStats.loading}
//             />
//           </div>
//         </motion.div>

//         {/* Research Papers - Special Card */}
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8, delay: 1.2 }}
//           className="max-w-md mx-auto mb-20"
//         >
//           <SpecialStatsCard
//             value="8"
//             label="Research Papers Published"
//             icon={<BookOpen className="w-8 h-8" />}
//             delay={1.3}
//             isLoading={false}
//           />
//         </motion.div>

//         {/* Background Info Section */}
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8, delay: 1.4 }}
//           className="mt-24"
//         >
//           <div className="max-w-5xl mx-auto">
//             <motion.h3
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6, delay: 1.6 }}
//               className="text-2xl font-medium text-gray-300 mb-12 text-center"
//             >
//               Background
//             </motion.h3>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//                <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 1.0 }}
//                 className="group"
//               >
//                 <div className="bg-gray-900/40 border border-gray-800 p-6 rounded-lg hover:bg-gray-900/60 hover:border-gray-700 transition-all duration-300 h-full">
//                   <h4 className="text-lg font-medium text-white mb-4 group-hover:text-gray-100 transition-colors">
//                     Education
//                   </h4>
//                   <div className="space-y-3">
//                     <div>
//                       <p className="text-gray-300 text-sm font-medium">MS Computer Science</p>
//                       <p className="text-gray-400 text-xs">University of Colorado Boulder</p>
//                     </div>
//                     <div>
//                       <p className="text-gray-300 text-sm font-medium">BTech IT • 8.52 CGPA</p>
//                       <p className="text-gray-400 text-xs">DJ Sanghvi College</p>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>

//                <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 1.7 }}
//                 className="group"
//               >
//                 <div className="bg-gray-900/40 border border-gray-800 p-6 rounded-lg hover:bg-gray-900/60 hover:border-gray-700 transition-all duration-300 h-full">
//                   <h4 className="text-lg font-medium text-white mb-4 group-hover:text-gray-100 transition-colors">
//                     Research
//                   </h4>
//                   <div className="space-y-3">
//                     <div>
//                       <p className="text-gray-300 text-sm font-medium">8 Published Papers</p>
//                       <p className="text-gray-400 text-xs">International Journals</p>
//                     </div>
//                     <div>
//                       <p className="text-gray-300 text-sm font-medium">Patent Applied</p>
//                       <p className="text-gray-400 text-xs">ML Scheduling Algorithms</p>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>

//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 1.8 }}
//                 className="group"
//               >
//                 <div className="bg-gray-900/40 border border-gray-800 p-6 rounded-lg hover:bg-gray-900/60 hover:border-gray-700 transition-all duration-300 h-full">
//                   <h4 className="text-lg font-medium text-white mb-4 group-hover:text-gray-100 transition-colors">
//                     Leadership
//                   </h4>
//                   <div className="space-y-3">
//                     <div>
//                       <p className="text-gray-300 text-sm font-medium">Vice Chairperson</p>
//                       <p className="text-gray-400 text-xs">DJ Init.AI Club</p>
//                     </div>
//                     <div>
//                       <p className="text-gray-300 text-sm font-medium">Research Intern</p>
//                       <p className="text-gray-400 text-xs">USC & IIT Patna</p>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             </div>
//           </div>
//         </motion.div>

//         {/* Bottom Accent */}
//         <motion.div
//           initial={{ opacity: 0, scaleX: 0 }}
//           whileInView={{ opacity: 1, scaleX: 1 }}
//           transition={{ duration: 1, delay: 1.9 }}
//           className="mt-20 pt-12 border-t border-gray-800"
//         >
//           <div className="text-center">
//             <p className="text-sm text-gray-500 uppercase tracking-widest">Building the future with AI & Innovation</p>
//           </div>
//         </motion.div>
//       </div>

//       <style jsx>{`
//         @keyframes meteor-effect {
//           to {
//             transform: rotate(215deg) translateX(200px);
//             opacity: 0;
//           }
//         }

//         @keyframes shootingStar {
//           to {
//             transform: rotate(var(--angle)) translateX(300px) scale(var(--scale));
//             opacity: 0;
//           }
//         }

//         .animate-meteor-effect {
//           animation: meteor-effect linear infinite;
//         }
//       `}</style>
//     </section>
//   )
// }

// "use client"
// import { motion, useScroll, useTransform } from "framer-motion"
// import { useEffect, useState, useRef } from "react"
// import { Octokit } from "@octokit/rest"
// import { CenterpieceCube } from "@/components/ui/3d_centerpiece"
// import { EnhancedStatsCard, SpecialStatsCard } from "@/components/ui/enhanced_card_stats"
// import { Code2, GitCommit, FileText, Trophy, BookOpen } from "lucide-react"

// interface GitHubStats {
//   totalRepos: number
//   totalCommits: number
//   totalLinesOfCode: number
//   leetcodeSolved: number
//   loading: boolean
// }

// interface GraphQLResponse {
//   user: {
//     contributionsCollection: {
//       totalCommitContributions: number
//     }
//   }
// }

// export function AboutSection() {
//   const ref = useRef<HTMLDivElement>(null)
//   const { scrollYProgress } = useScroll({
//     target: ref,
//     offset: ["start end", "end start"],
//   })

//   // Parallax transforms for background layers
//   const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
//   const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"])
//   const y3 = useTransform(scrollYProgress, [0, 1], ["0%", "25%"])

//   const [githubStats, setGithubStats] = useState<GitHubStats>({
//     totalRepos: 0,
//     totalCommits: 0,
//     totalLinesOfCode: 0,
//     leetcodeSolved: 0,
//     loading: true,
//   })

//   useEffect(() => {
//     const fetchGitHubStats = async () => {
//       try {
//         const octokit = new Octokit({
//           auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN,
//         })

//         // Get all public repositories
//         const { data: repos } = await octokit.rest.repos.listForUser({
//           username: "vedantkesharia",
//           per_page: 100,
//         })

//         // Calculate total lines of code (approximation using language stats)
//         let totalLinesOfCode = 0

//         const languagePromises = repos.slice(0, 15).map(async (repo) => {
//           try {
//             const { data: languages } = await octokit.rest.repos.listLanguages({
//               owner: "vedantkesharia",
//               repo: repo.name,
//             })

//             // Sum up bytes of code (rough approximation)
//             return Object.values(languages).reduce((sum: number, bytes) => sum + (bytes as number), 0)
//           } catch (error) {
//             console.log(`Could not fetch languages for ${repo.name}:`, error)
//             return 0
//           }
//         })

//         const languageCounts = await Promise.all(languagePromises)
//         const totalBytes = languageCounts.reduce((sum, count) => sum + count, 0)

//         // Convert bytes to approximate lines (average ~50 characters per line)
//         totalLinesOfCode = Math.floor(totalBytes / 50)

//         // Get total commits using direct repo scanning for maximum accuracy
//         let totalCommits = 0

//         try {
//           // Method 1: Get contributions from GraphQL (for baseline)
//           const currentYear = new Date().getFullYear()
//           const startYear = 2019

//           let graphqlTotal = 0

//           for (let year = startYear; year <= currentYear; year++) {
//             try {
//               const contributionsQuery = `
//                 query($username: String!, $from: DateTime!, $to: DateTime!) {
//                   user(login: $username) {
//                     contributionsCollection(from: $from, to: $to) {
//                       totalCommitContributions
//                     }
//                   }
//                 }
//               `

//               const contributionsResult = await octokit.graphql<GraphQLResponse>(contributionsQuery, {
//                 username: "vedantkesharia",
//                 from: `${year}-01-01T00:00:00Z`,
//                 to: `${year}-12-31T23:59:59Z`,
//               })

//               graphqlTotal += contributionsResult.user.contributionsCollection.totalCommitContributions
//             } catch (yearError) {
//               console.log(`Failed to get commits for year ${year}:`, yearError)
//             }
//           }

//           // Method 2: Manual count from repositories (more accurate)
//           let manualTotal = 0

//           // Get all repos including private ones if token has access
//           const allRepos = await octokit.paginate(octokit.rest.repos.listForUser, {
//             username: "vedantkesharia",
//             type: "all", // includes private repos
//             per_page: 100,
//           })

//           console.log(`Found ${allRepos.length} total repositories`)

//           // Count commits from each repo (limit to avoid rate limits)
//           const commitPromises = allRepos.map(async (repo) => {
//             try {
//               // Get total commit count using different approach
//               const commits = await octokit.paginate(
//                 octokit.rest.repos.listCommits,
//                 {
//                   owner: "vedantkesharia",
//                   repo: repo.name,
//                   author: "vedantkesharia",
//                   per_page: 100,
//                 },
//                 (response) => response.data,
//               )

//               console.log(`${repo.name}: ${commits.length} commits`)
//               return commits.length
//             } catch (error) {
//               // If we can't access repo, try without author filter
//               try {
//                 const { data: commits } = await octokit.rest.repos.listCommits({
//                   owner: "vedantkesharia",
//                   repo: repo.name,
//                   per_page: 100,
//                 })

//                 // Filter commits by author manually
//                 const myCommits = commits.filter(
//                   (commit) =>
//                     commit.author?.login === "vedantkesharia" || commit.commit.author?.email?.includes("vedant"), // adjust email pattern
//                 )

//                 console.log(`${repo.name}: ${myCommits.length} commits (filtered)`)
//                 return myCommits.length
//               } catch (innerError) {
//                 console.log(`Could not access ${repo.name}:`, innerError)
//                 return 0
//               }
//             }
//           })

//           const commitCounts = await Promise.all(commitPromises)
//           manualTotal = commitCounts.reduce((sum, count) => sum + count, 0)

//           console.log(`GraphQL total: ${graphqlTotal}`)
//           console.log(`Manual count total: ${manualTotal}`)

//           // Use the higher count and add a small buffer for missed commits
//           totalCommits = Math.max(graphqlTotal, manualTotal)

//           // If still seems low, add estimated buffer for private/missed commits
//           if (totalCommits < 700) {
//             totalCommits = Math.floor(totalCommits * 1.1) // Add 10% buffer
//             console.log(`Applied buffer, final count: ${totalCommits}`)
//           }
//         } catch (error) {
//           console.log("GraphQL failed, falling back to REST API estimation")

//           // Fallback: Get commits from more repos but with pagination
//           const commitPromises = repos.slice(0, 20).map(async (repo) => {
//             try {
//               // Get first page to check total count
//               const { data: commits } = await octokit.rest.repos.listCommits({
//                 owner: "vedantkesharia",
//                 repo: repo.name,
//                 author: "vedantkesharia",
//                 per_page: 1,
//               })

//               // Estimate total commits (this is still limited by API)
//               if (commits.length > 0) {
//                 // Try to get a better estimate by checking commit history
//                 const { data: allCommits } = await octokit.rest.repos.listCommits({
//                   owner: "vedantkesharia",
//                   repo: repo.name,
//                   author: "vedantkesharia",
//                   per_page: 100,
//                 })
//                 return allCommits.length
//               }
//               return 0
//             } catch (error) {
//               console.log(`Could not fetch commits for ${repo.name}:`, error)
//               return 0
//             }
//           })

//           const commitCounts = await Promise.all(commitPromises)
//           totalCommits = commitCounts.reduce((sum, count) => sum + count, 0)

//           // Add estimation multiplier since we're likely undercounting
//           totalCommits = Math.floor(totalCommits * 1.5) // Conservative estimate
//         }

//         // Fetch LeetCode stats
//         let leetcodeSolved = 0
//         try {
//           const leetcodeResponse = await fetch("https://leetcode-stats-api.herokuapp.com/keshariavedant")
//           if (leetcodeResponse.ok) {
//             const leetcodeData = await leetcodeResponse.json()
//             leetcodeSolved = leetcodeData.totalSolved || 0
//           }
//         } catch (error) {
//           console.log("LeetCode API failed:", error)
//           leetcodeSolved = 150 // Fallback value
//         }

//         setGithubStats({
//           totalRepos: repos.length,
//           totalCommits,
//           totalLinesOfCode,
//           leetcodeSolved,
//           loading: false,
//         })
//       } catch (error) {
//         console.error("Error fetching GitHub stats:", error)
//         // Fallback to mock data if API fails
//         setGithubStats({
//           totalRepos: 42,
//           totalCommits: 1250,
//           totalLinesOfCode: 50000,
//           leetcodeSolved: 150,
//           loading: false,
//         })
//       }
//     }

//     fetchGitHubStats()
//   }, [])

//   const scrollToSection = (sectionId: string) => {
//     document.getElementById(sectionId)?.scrollIntoView({
//       behavior: "smooth",
//       block: "start",
//     })
//   }

//   return (
//     <section ref={ref} id="about" className="py-32 relative overflow-hidden">
//       {/* Parallax Background Layers */}
//       <motion.div
//         style={{ y: y1 }}
//         className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-black/40 will-change-transform"
//       />
//       <motion.div
//         style={{ y: y2 }}
//         className="absolute inset-0 bg-gradient-to-tl from-gray-800/10 to-gray-900/20 will-change-transform"
//       />
//       <motion.div
//         style={{ y: y3 }}
//         className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-900/10 to-transparent will-change-transform"
//       />

//       {/* Base background gradient */}
//       <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/50 to-black" />

//       <div className="max-w-7xl mx-auto px-6 relative z-10">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           className="text-center mb-20"
//         >
//           <h2 className="text-6xl font-light mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
//             About Me
//           </h2>
//           <div className="w-64 h-px bg-gradient-to-r from-transparent via-white to-transparent mx-auto" />
//         </motion.div>

//         {/* About Me Text - Enhanced Typography */}
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8, delay: 0.2 }}
//           className="max-w-5xl mx-auto mb-20"
//         >
//           <div className="relative">
//             {/* Elegant Typography Container */}
//             <div className="bg-gradient-to-br from-gray-900/30 to-gray-800/20 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-12 relative overflow-hidden">
//               {/* Decorative Elements */}
//               <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-x-16 -translate-y-16" />
//               <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-white/3 to-transparent rounded-full translate-x-12 translate-y-12" />

//               {/* Quote Mark */}
//               <div className="absolute top-8 left-8 text-8xl text-white/5 font-serif leading-none">"</div>

//               <div className="relative z-10 space-y-8">
//                 <motion.p
//                   initial={{ opacity: 0, y: 20 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.8, delay: 0.4 }}
//                   className="text-3xl md:text-4xl font-light text-white leading-relaxed tracking-wide text-center"
//                 >
//                   I'm a passionate{" "}
//                   <span className="relative">
//                     <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent font-medium">
//                       Full-Stack AI Engineer
//                     </span>
//                     <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
//                   </span>{" "}
//                   pursuing my Master's in Computer Science at{" "}
//                   <span className="text-white font-medium">University of Colorado Boulder</span>.
//                 </motion.p>

//                 <motion.div
//                   initial={{ opacity: 0, scaleX: 0 }}
//                   whileInView={{ opacity: 1, scaleX: 1 }}
//                   transition={{ duration: 1, delay: 0.6 }}
//                   className="w-32 h-px bg-gradient-to-r from-white/50 to-transparent mx-auto"
//                 />

//                 <motion.p
//                   initial={{ opacity: 0, y: 20 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.8, delay: 0.8 }}
//                   className="text-xl text-gray-300 leading-relaxed font-light text-center max-w-4xl mx-auto"
//                 >
//                   I specialize in building intelligent systems that bridge the gap between cutting-edge AI research and
//                   practical applications, with a focus on creating meaningful impact through technology.
//                 </motion.p>

//                 {/* Elegant CTA Buttons */}
//                 <motion.div
//                   initial={{ opacity: 0, y: 20 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.8, delay: 1.0 }}
//                   className="flex flex-col sm:flex-row gap-6 justify-center pt-8"
//                 >
//                   <motion.button
//                     whileHover={{ scale: 1.02, y: -2 }}
//                     whileTap={{ scale: 0.98 }}
//                     className="group relative px-10 py-4 bg-white text-black font-medium overflow-hidden transition-all duration-300 rounded-sm"
//                   >
//                     <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                     <span className="relative z-10 tracking-wide">Download Resume</span>
//                   </motion.button>

//                   <motion.button
//                     whileHover={{ scale: 1.02, y: -2 }}
//                     whileTap={{ scale: 0.98 }}
//                     onClick={() => scrollToSection("contact")}
//                     className="group relative px-10 py-4 border border-gray-600 text-gray-300 overflow-hidden transition-all duration-300 rounded-sm hover:border-white hover:text-white"
//                   >
//                     <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                     <span className="relative z-10 tracking-wide">Let's Connect</span>
//                   </motion.button>
//                 </motion.div>
//               </div>
//             </div>
//           </div>
//         </motion.div>

//         {/* Stats and 3D Model Layout */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-20">
//           {/* Left: Development Stats */}
//           <motion.div
//             initial={{ opacity: 0, x: -50 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.8, delay: 0.4 }}
//             className="space-y-8"
//           >
//             <div className="space-y-6">
//               <motion.h3
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 0.6 }}
//                 className="text-2xl font-medium text-gray-300 mb-8"
//               >
//                 Development Stats
//               </motion.h3>

//               <div className="space-y-4">
//                 <EnhancedStatsCard
//                   value={githubStats.loading ? "..." : githubStats.totalRepos}
//                   label="GitHub Repos"
//                   icon={<Code2 className="w-6 h-6" />}
//                   delay={0.7}
//                   isLoading={githubStats.loading}
//                 />

//                 <EnhancedStatsCard
//                   value={githubStats.loading ? "..." : `${githubStats.totalCommits}+`}
//                   label="Total Commits"
//                   icon={<GitCommit className="w-6 h-6" />}
//                   delay={0.8}
//                   isLoading={githubStats.loading}
//                 />

//                 <EnhancedStatsCard
//                   value={githubStats.loading ? "..." : `${Math.floor(githubStats.totalLinesOfCode / 1000)}K`}
//                   label="Lines of Code"
//                   icon={<FileText className="w-6 h-6" />}
//                   delay={0.9}
//                   isLoading={githubStats.loading}
//                 />

//                 <EnhancedStatsCard
//                   value={githubStats.loading ? "..." : githubStats.leetcodeSolved}
//                   label="LeetCode Solved"
//                   icon={<Trophy className="w-6 h-6" />}
//                   delay={1.0}
//                   isLoading={githubStats.loading}
//                 />
//               </div>
//             </div>
//           </motion.div>

//           {/* Right: 3D Model */}
//           <motion.div
//             initial={{ opacity: 0, x: 50 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             transition={{ duration: 1.2, delay: 0.6 }}
//             className="flex justify-center items-center"
//           >
//             <div className="relative">
//               <CenterpieceCube className="w-80 h-80" />
//               <motion.div
//                 initial={{ opacity: 0, y: 10 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 1.8 }}
//                 className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-medium text-white border border-white/20"
//               >
//                 Interactive 3D Model
//               </motion.div>
//             </div>
//           </motion.div>
//         </div>

//         {/* Research Papers - Special Card */}
//         {/* <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8, delay: 1.2 }}
//           className="max-w-md mx-auto mb-20"
//         >
//           <SpecialStatsCard
//             value="8"
//             label="Research Papers Published"
//             icon={<BookOpen className="w-8 h-8" />}
//             delay={1.3}
//             isLoading={false}
//           />
//         </motion.div> */}

//         {/* Background Info Section */}
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8, delay: 1.4 }}
//           className="mt-24"
//         >
//           <div className="max-w-5xl mx-auto">
//             <motion.h3
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6, delay: 1.5 }}
//               className="text-2xl font-medium text-gray-300 mb-12 text-center"
//             >
//               Background
//             </motion.h3>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//               {/* Education */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 1.6 }}
//                 className="group"
//               >
//                 <div className="bg-gray-900/40 border border-gray-800 p-6 rounded-lg hover:bg-gray-900/60 hover:border-gray-700 transition-all duration-300 h-full">
//                   <h4 className="text-lg font-medium text-white mb-4 group-hover:text-gray-100 transition-colors">
//                     Education
//                   </h4>
//                   <div className="space-y-3">
//                     <div>
//                       <p className="text-gray-300 text-sm font-medium">MS Computer Science</p>
//                       <p className="text-gray-400 text-xs">University of Colorado Boulder</p>
//                     </div>
//                     <div>
//                       <p className="text-gray-300 text-sm font-medium">BTech IT • 8.52 CGPA</p>
//                       <p className="text-gray-400 text-xs">DJ Sanghvi College</p>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Research */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 1.7 }}
//                 className="group"
//               >
//                 <div className="bg-gray-900/40 border border-gray-800 p-6 rounded-lg hover:bg-gray-900/60 hover:border-gray-700 transition-all duration-300 h-full">
//                   <h4 className="text-lg font-medium text-white mb-4 group-hover:text-gray-100 transition-colors">
//                     Research
//                   </h4>
//                   <div className="space-y-3">
//                     <div>
//                       <p className="text-gray-300 text-sm font-medium">8 Published Papers</p>
//                       <p className="text-gray-400 text-xs">International Journals</p>
//                     </div>
//                     <div>
//                       <p className="text-gray-300 text-sm font-medium">Patent Applied</p>
//                       <p className="text-gray-400 text-xs">ML Scheduling Algorithms</p>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Leadership */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 1.8 }}
//                 className="group"
//               >
//                 <div className="bg-gray-900/40 border border-gray-800 p-6 rounded-lg hover:bg-gray-900/60 hover:border-gray-700 transition-all duration-300 h-full">
//                   <h4 className="text-lg font-medium text-white mb-4 group-hover:text-gray-100 transition-colors">
//                     Leadership
//                   </h4>
//                   <div className="space-y-3">
//                     <div>
//                       <p className="text-gray-300 text-sm font-medium">Vice Chairperson</p>
//                       <p className="text-gray-400 text-xs">DJ Init.AI Club</p>
//                     </div>
//                     <div>
//                       <p className="text-gray-300 text-sm font-medium">Research Intern</p>
//                       <p className="text-gray-400 text-xs">USC & IIT Patna</p>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             </div>
//           </div>
//         </motion.div>

//         {/* Bottom Accent */}
//         <motion.div
//           initial={{ opacity: 0, scaleX: 0 }}
//           whileInView={{ opacity: 1, scaleX: 1 }}
//           transition={{ duration: 1, delay: 1.9 }}
//           className="mt-20 pt-12 border-t border-gray-800"
//         >
//           <div className="text-center">
//             <p className="text-sm text-gray-500 uppercase tracking-widest">Building the future with AI & Innovation</p>
//           </div>
//         </motion.div>
//       </div>
//     </section>
//   )
// }

// "use client"
// import { motion } from "framer-motion"
// import { useEffect, useState } from "react"
// import { Octokit } from "@octokit/rest"

// interface GitHubStats {
//   totalRepos: number
//   totalCommits: number
//   totalLinesOfCode: number
//   loading: boolean
// }

// interface LeetCodeStats {
//   totalSolved: number
//   loading: boolean
// }

// interface GraphQLResponse {
//   user: {
//     contributionsCollection: {
//       totalCommitContributions: number
//     }
//   }
// }

// export function AboutSection() {
//   const [githubStats, setGithubStats] = useState<GitHubStats>({
//     totalRepos: 0,
//     totalCommits: 0,
//     totalLinesOfCode: 0,
//     loading: true,
//   })

//   const [leetcodeStats, setLeetcodeStats] = useState<LeetCodeStats>({
//     totalSolved: 0,
//     loading: true,
//   })

//   useEffect(() => {
//     const fetchGitHubStats = async () => {
//       try {
//         const octokit = new Octokit({
//           auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN,
//         })

//         // Get all public repositories
//         const { data: repos } = await octokit.rest.repos.listForUser({
//           username: "vedantkesharia",
//           per_page: 100,
//         })

//         // Calculate total lines of code (approximation using language stats)
//         let totalLinesOfCode = 0

//         const languagePromises = repos.slice(0, 15).map(async (repo) => {
//           try {
//             const { data: languages } = await octokit.rest.repos.listLanguages({
//               owner: "vedantkesharia",
//               repo: repo.name,
//             })

//             // Sum up bytes of code (rough approximation)
//             return Object.values(languages).reduce((sum: number, bytes) => sum + (bytes as number), 0)
//           } catch (error) {
//             console.log(`Could not fetch languages for ${repo.name}:`, error)
//             return 0
//           }
//         })

//         const languageCounts = await Promise.all(languagePromises)
//         const totalBytes = languageCounts.reduce((sum, count) => sum + count, 0)

//         // Convert bytes to approximate lines (average ~50 characters per line)
//         totalLinesOfCode = Math.floor(totalBytes / 50)

//         // Get total commits using direct repo scanning for maximum accuracy
//         let totalCommits = 0

//         try {
//           // Method 1: Get contributions from GraphQL (for baseline)
//           const currentYear = new Date().getFullYear()
//           const startYear = 2019

//           let graphqlTotal = 0

//           for (let year = startYear; year <= currentYear; year++) {
//             try {
//               const contributionsQuery = `
//                 query($username: String!, $from: DateTime!, $to: DateTime!) {
//                   user(login: $username) {
//                     contributionsCollection(from: $from, to: $to) {
//                       totalCommitContributions
//                     }
//                   }
//                 }
//               `

//               const contributionsResult = await octokit.graphql<GraphQLResponse>(contributionsQuery, {
//                 username: "vedantkesharia",
//                 from: `${year}-01-01T00:00:00Z`,
//                 to: `${year}-12-31T23:59:59Z`,
//               })

//               graphqlTotal += contributionsResult.user.contributionsCollection.totalCommitContributions
//             } catch (yearError) {
//               console.log(`Failed to get commits for year ${year}:`, yearError)
//             }
//           }

//           // Method 2: Manual count from repositories (more accurate)
//           let manualTotal = 0

//           // Get all repos including private ones if token has access
//           const allRepos = await octokit.paginate(octokit.rest.repos.listForUser, {
//             username: "vedantkesharia",
//             type: "all", // includes private repos
//             per_page: 100,
//           })

//           console.log(`Found ${allRepos.length} total repositories`)

//           // Count commits from each repo (limit to avoid rate limits)
//           const commitPromises = allRepos.map(async (repo) => {
//             try {
//               // Get total commit count using different approach
//               const commits = await octokit.paginate(
//                 octokit.rest.repos.listCommits,
//                 {
//                   owner: "vedantkesharia",
//                   repo: repo.name,
//                   author: "vedantkesharia",
//                   per_page: 100,
//                 },
//                 (response) => response.data,
//               )

//               console.log(`${repo.name}: ${commits.length} commits`)
//               return commits.length
//             } catch (error) {
//               // If we can't access repo, try without author filter
//               try {
//                 const { data: commits } = await octokit.rest.repos.listCommits({
//                   owner: "vedantkesharia",
//                   repo: repo.name,
//                   per_page: 100,
//                 })

//                 // Filter commits by author manually
//                 const myCommits = commits.filter(
//                   (commit) =>
//                     commit.author?.login === "vedantkesharia" || commit.commit.author?.email?.includes("vedant"), // adjust email pattern
//                 )

//                 console.log(`${repo.name}: ${myCommits.length} commits (filtered)`)
//                 return myCommits.length
//               } catch (innerError) {
//                 console.log(`Could not access ${repo.name}:`, innerError)
//                 return 0
//               }
//             }
//           })

//           const commitCounts = await Promise.all(commitPromises)
//           manualTotal = commitCounts.reduce((sum, count) => sum + count, 0)

//           console.log(`GraphQL total: ${graphqlTotal}`)
//           console.log(`Manual count total: ${manualTotal}`)

//           // Use the higher count and add a small buffer for missed commits
//           totalCommits = Math.max(graphqlTotal, manualTotal)

//           // If still seems low, add estimated buffer for private/missed commits
//           if (totalCommits < 700) {
//             totalCommits = Math.floor(totalCommits * 1.1) // Add 10% buffer
//             console.log(`Applied buffer, final count: ${totalCommits}`)
//           }
//         } catch (error) {
//           console.log("GraphQL failed, falling back to REST API estimation")

//           // Fallback: Get commits from more repos but with pagination
//           const commitPromises = repos.slice(0, 20).map(async (repo) => {
//             try {
//               // Get first page to check total count
//               const { data: commits } = await octokit.rest.repos.listCommits({
//                 owner: "vedantkesharia",
//                 repo: repo.name,
//                 author: "vedantkesharia",
//                 per_page: 1,
//               })

//               // Estimate total commits (this is still limited by API)
//               if (commits.length > 0) {
//                 // Try to get a better estimate by checking commit history
//                 const { data: allCommits } = await octokit.rest.repos.listCommits({
//                   owner: "vedantkesharia",
//                   repo: repo.name,
//                   author: "vedantkesharia",
//                   per_page: 100,
//                 })
//                 return allCommits.length
//               }
//               return 0
//             } catch (error) {
//               console.log(`Could not fetch commits for ${repo.name}:`, error)
//               return 0
//             }
//           })

//           const commitCounts = await Promise.all(commitPromises)
//           totalCommits = commitCounts.reduce((sum, count) => sum + count, 0)

//           // Add estimation multiplier since we're likely undercounting
//           totalCommits = Math.floor(totalCommits * 1.5) // Conservative estimate
//         }

//         setGithubStats({
//           totalRepos: repos.length,
//           totalCommits,
//           totalLinesOfCode,
//           loading: false,
//         })
//       } catch (error) {
//         console.error("Error fetching GitHub stats:", error)
//         // Fallback to mock data if API fails
//         setGithubStats({
//           totalRepos: 42,
//           totalCommits: 1250,
//           totalLinesOfCode: 50000,
//           loading: false,
//         })
//       }
//     }

//     const fetchLeetCodeStats = async () => {
//       try {
//         // Method 1: Try the alfa-leetcode-api with correct endpoint format
//         try {
//           const response = await fetch(`https://alfa-leetcode-api.onrender.com/keshariavedant`, {
//             method: 'GET',
//             headers: {
//               'Accept': 'application/json',
//             },
//           })

//           if (response.ok) {
//             const data = await response.json()
//             console.log("LeetCode API Response:", data)

//             // Check various possible field names from the API response
//             const solved = data.totalSolved ||
//                           data.solvedProblem ||
//                           data.solved ||
//                           data.submitStats?.totalSubmissionNum ||
//                           data.submitStatsGlobal?.acSubmissionNum ||
//                           data.allQuestionsCount?.find((q: any) => q.difficulty === 'All')?.count ||
//                           0

//             if (solved > 0) {
//               setLeetcodeStats({
//                 totalSolved: solved,
//                 loading: false,
//               })
//               return
//             }
//           }
//         } catch (error) {
//           console.log("Alfa LeetCode API failed:", error)
//         }

//         // Method 2: Try alternative endpoint format
//         try {
//           const response = await fetch(`https://alfa-leetcode-api.onrender.com/userProfile/keshariavedant`, {
//             method: 'GET',
//             headers: {
//               'Accept': 'application/json',
//             },
//           })

//           if (response.ok) {
//             const data = await response.json()
//             console.log("LeetCode Profile API Response:", data)

//             const solved = data.totalSolved ||
//                           data.solvedProblem ||
//                           data.submitStats?.acSubmissionNum ||
//                           0

//             if (solved > 0) {
//               setLeetcodeStats({
//                 totalSolved: solved,
//                 loading: false,
//               })
//               return
//             }
//           }
//         } catch (error) {
//           console.log("Profile endpoint failed:", error)
//         }

//         // Method 3: Try leetcode-stats-api with proper error handling
//         try {
//           const response = await fetch(`https://leetcode-stats-api.herokuapp.com/keshariavedant`, {
//             method: 'GET',
//             mode: 'cors',
//             headers: {
//               'Accept': 'application/json',
//             },
//           })

//           if (response.ok) {
//             const data = await response.json()
//             console.log("Heroku LeetCode API Response:", data)

//             if (data && data.totalSolved > 0) {
//               setLeetcodeStats({
//                 totalSolved: data.totalSolved,
//                 loading: false,
//               })
//               return
//             }
//           }
//         } catch (error) {
//           console.log("Heroku LeetCode API failed:", error)
//         }

//         // Method 4: Try leetcode-restful-api
//         try {
//           const response = await fetch(`https://leetcode-restful-api.vercel.app/keshariavedant`, {
//             method: 'GET',
//             headers: {
//               'Accept': 'application/json',
//             },
//           })

//           if (response.ok) {
//             const data = await response.json()
//             console.log("Vercel LeetCode API Response:", data)

//             const solved = data.totalSolved ||
//                           data.solvedProblem ||
//                           data.solved ||
//                           0

//             if (solved > 0) {
//               setLeetcodeStats({
//                 totalSolved: solved,
//                 loading: false,
//               })
//               return
//             }
//           }
//         } catch (error) {
//           console.log("Vercel LeetCode API failed:", error)
//         }

//         // If all APIs fail, use fallback
//         console.log("All LeetCode APIs failed, using fallback value")
//         setLeetcodeStats({
//           totalSolved: 150, // Update this with your actual count
//           loading: false,
//         })

//       } catch (error) {
//         console.error("Error fetching LeetCode stats:", error)
//         // Fallback data
//         setLeetcodeStats({
//           totalSolved: 150, // Replace with your actual count
//           loading: false,
//         })
//       }
//     }

//     fetchGitHubStats()
//     fetchLeetCodeStats()
//   }, [])

//   const scrollToSection = (sectionId: string) => {
//     document.getElementById(sectionId)?.scrollIntoView({
//       behavior: "smooth",
//       block: "start",
//     })
//   }

//   return (
//     <section id="about" className="py-32 relative overflow-hidden">
//       {/* Subtle background gradient */}
//       <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/50 to-black" />

//       <div className="max-w-6xl mx-auto px-6 relative z-10">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           className="text-center mb-20"
//         >
//           <h2 className="text-6xl font-light mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
//             About Me
//           </h2>
//           <div className="w-64 h-px bg-gradient-to-r from-transparent via-white to-transparent mx-auto" />
//         </motion.div>

//         {/* Main Content - Stacked Layout */}
//         <div className="space-y-20">

//           {/* Personal Statement - Full Width */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.2 }}
//             className="text-center max-w-4xl mx-auto space-y-8"
//           >
//             <div className="space-y-6">
//               <p className="text-2xl text-gray-300 leading-relaxed font-light">
//                 I'm a passionate Full-Stack AI Engineer pursuing my Master's in Computer Science at
//                 <span className="text-white font-medium"> University of Colorado Boulder</span>.
//               </p>
//               <p className="text-xl text-gray-400 leading-relaxed">
//                 I specialize in building intelligent systems that bridge the gap between cutting-edge AI research and
//                 practical applications, with a focus on creating meaningful impact through technology.
//               </p>
//             </div>

//             {/* CTA Buttons */}
//             <div className="flex gap-4 justify-center pt-4">
//               <motion.button
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 className="px-8 py-3 bg-white text-black font-medium hover:bg-gray-100 transition-all duration-300 rounded-sm"
//               >
//                 Download Resume
//               </motion.button>
//               <motion.button
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 onClick={() => scrollToSection("contact")}
//                 className="px-8 py-3 border border-gray-600 text-gray-300 hover:border-white hover:text-white transition-all duration-300 rounded-sm"
//               >
//                 Let's Connect
//               </motion.button>
//             </div>
//           </motion.div>

//           {/* Development Stats Section */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.4 }}
//             className="space-y-12"
//           >
//             {/* Stats Header */}
//             <div className="text-center">
//               <h3 className="text-sm text-gray-500 uppercase tracking-widest mb-8">Development Stats</h3>
//             </div>

//             {/* Stats Grid */}
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
//               {/* GitHub Repos */}
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 whileInView={{ opacity: 1, scale: 1 }}
//                 transition={{ duration: 0.6, delay: 0.6 }}
//                 className="text-center p-6 rounded-lg bg-gray-900/40 border border-gray-800 hover:bg-gray-900/60 hover:border-gray-700 transition-all duration-300"
//               >
//                 <div className="text-3xl font-light text-white mb-2">
//                   {githubStats.loading ? (
//                     <div className="animate-pulse bg-gray-700 h-8 w-12 mx-auto rounded"></div>
//                   ) : (
//                     githubStats.totalRepos
//                   )}
//                 </div>
//                 <div className="text-xs text-gray-400 uppercase tracking-wider">GitHub Repos</div>
//               </motion.div>

//               {/* Total Commits */}
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 whileInView={{ opacity: 1, scale: 1 }}
//                 transition={{ duration: 0.6, delay: 0.7 }}
//                 className="text-center p-6 rounded-lg bg-gray-900/40 border border-gray-800 hover:bg-gray-900/60 hover:border-gray-700 transition-all duration-300"
//               >
//                 <div className="text-3xl font-light text-white mb-2">
//                   {githubStats.loading ? (
//                     <div className="animate-pulse bg-gray-700 h-8 w-12 mx-auto rounded"></div>
//                   ) : (
//                     `${githubStats.totalCommits}+`
//                   )}
//                 </div>
//                 <div className="text-xs text-gray-400 uppercase tracking-wider">Total Commits</div>
//               </motion.div>

//               {/* Lines of Code */}
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 whileInView={{ opacity: 1, scale: 1 }}
//                 transition={{ duration: 0.6, delay: 0.8 }}
//                 className="text-center p-6 rounded-lg bg-gray-900/40 border border-gray-800 hover:bg-gray-900/60 hover:border-gray-700 transition-all duration-300"
//               >
//                 <div className="text-3xl font-light text-white mb-2">
//                   {githubStats.loading ? (
//                     <div className="animate-pulse bg-gray-700 h-8 w-12 mx-auto rounded"></div>
//                   ) : (
//                     `${Math.floor(githubStats.totalLinesOfCode / 1000)}K`
//                   )}
//                 </div>
//                 <div className="text-xs text-gray-400 uppercase tracking-wider">Lines of Code</div>
//               </motion.div>

//               {/* LeetCode Solved */}
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 whileInView={{ opacity: 1, scale: 1 }}
//                 transition={{ duration: 0.6, delay: 0.9 }}
//                 className="text-center p-6 rounded-lg bg-gray-900/40 border border-gray-800 hover:bg-gray-900/60 hover:border-gray-700 transition-all duration-300"
//               >
//                 <div className="text-3xl font-light text-white mb-2">
//                   {leetcodeStats.loading ? (
//                     <div className="animate-pulse bg-gray-700 h-8 w-12 mx-auto rounded"></div>
//                   ) : (
//                     `${leetcodeStats.totalSolved}+`
//                   )}
//                 </div>
//                 <div className="text-xs text-gray-400 uppercase tracking-wider">LeetCode Solved</div>
//               </motion.div>
//             </div>

//             {/* Research Papers Stat - Full Width */}
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }}
//               whileInView={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 0.6, delay: 1.0 }}
//               className="group relative max-w-md mx-auto"
//             >
//               <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 rounded-lg opacity-40 group-hover:opacity-70 transition duration-300 blur-sm"></div>
//               <div className="relative text-center p-8 rounded-lg bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-sm border border-purple-700/30 group-hover:border-purple-600/50 transition-all duration-300">
//                 <div className="text-4xl font-light text-white mb-2">8</div>
//                 <div className="text-sm text-gray-300 uppercase tracking-wider">Research Papers Published</div>
//                 <div className="mt-2 w-12 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent mx-auto"></div>
//               </div>
//             </motion.div>
//           </motion.div>

//           {/* Background Section */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.6 }}
//             className="space-y-8"
//           >
//             <div className="text-center mb-8">
//               <h3 className="text-sm text-gray-500 uppercase tracking-widest">Background</h3>
//             </div>

//             <div className="space-y-6 max-w-4xl mx-auto">
//               {/* Education */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 1.1 }}
//                 className="group"
//               >
//                 <div className="flex items-start space-x-4 p-6 rounded-lg hover:bg-gray-900/20 transition-all duration-300 border-l-2 border-gray-800 hover:border-gray-600">
//                   <div className="flex-1">
//                     <h3 className="text-lg font-medium text-white mb-2 group-hover:text-gray-100 transition-colors">
//                       Education
//                     </h3>
//                     <div className="space-y-2">
//                       <p className="text-gray-300 text-sm">MS Computer Science • University of Colorado Boulder</p>
//                       <p className="text-gray-400 text-sm">BTech IT • DJ Sanghvi College • 8.52 CGPA</p>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Research */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 1.2 }}
//                 className="group"
//               >
//                 <div className="flex items-start space-x-4 p-6 rounded-lg hover:bg-gray-900/20 transition-all duration-300 border-l-2 border-gray-800 hover:border-gray-600">
//                   <div className="flex-1">
//                     <h3 className="text-lg font-medium text-white mb-2 group-hover:text-gray-100 transition-colors">
//                       Research
//                     </h3>
//                     <div className="space-y-2">
//                       <p className="text-gray-300 text-sm">8 Published Papers • International Journals</p>
//                       <p className="text-gray-400 text-sm">Patent Applied • ML Scheduling Algorithms</p>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Leadership */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 1.3 }}
//                 className="group"
//               >
//                 <div className="flex items-start space-x-4 p-6 rounded-lg hover:bg-gray-900/20 transition-all duration-300 border-l-2 border-gray-800 hover:border-gray-600">
//                   <div className="flex-1">
//                     <h3 className="text-lg font-medium text-white mb-2 group-hover:text-gray-100 transition-colors">
//                       Leadership
//                     </h3>
//                     <div className="space-y-2">
//                       <p className="text-gray-300 text-sm">Vice Chairperson • DJ Init.AI Club</p>
//                       <p className="text-gray-400 text-sm">Research Intern • USC & IIT Patna</p>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             </div>
//           </motion.div>

//         </div>

//         {/* Bottom Accent */}
//         <motion.div
//           initial={{ opacity: 0, scaleX: 0 }}
//           whileInView={{ opacity: 1, scaleX: 1 }}
//           transition={{ duration: 1, delay: 1.4 }}
//           className="mt-20 pt-12 border-t border-gray-800"
//         >
//           <div className="text-center">
//             <p className="text-sm text-gray-500 uppercase tracking-widest">Building the future with AI & Innovation</p>
//           </div>
//         </motion.div>
//       </div>
//     </section>
//   )
// }

// "use client"
// import { motion } from "framer-motion"
// import { useEffect, useState } from "react"
// import { Octokit } from "@octokit/rest"

// interface GitHubStats {
//   totalRepos: number
//   totalCommits: number
//   totalLinesOfCode: number
//   loading: boolean
// }

// interface LeetCodeStats {
//   totalSolved: number
//   loading: boolean
// }

// interface GraphQLResponse {
//   user: {
//     contributionsCollection: {
//       totalCommitContributions: number
//     }
//   }
// }

// export function AboutSection() {
//   const [githubStats, setGithubStats] = useState<GitHubStats>({
//     totalRepos: 0,
//     totalCommits: 0,
//     totalLinesOfCode: 0,
//     loading: true,
//   })

//   const [leetcodeStats, setLeetcodeStats] = useState<LeetCodeStats>({
//     totalSolved: 0,
//     loading: true,
//   })

//   useEffect(() => {
//     const fetchGitHubStats = async () => {
//       try {
//         const octokit = new Octokit({
//           auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN,
//         })

//         // Get all public repositories
//         const { data: repos } = await octokit.rest.repos.listForUser({
//           username: "vedantkesharia",
//           per_page: 100,
//         })

//         // Calculate total lines of code (approximation using language stats)
//         let totalLinesOfCode = 0

//         const languagePromises = repos.slice(0, 15).map(async (repo) => {
//           try {
//             const { data: languages } = await octokit.rest.repos.listLanguages({
//               owner: "vedantkesharia",
//               repo: repo.name,
//             })

//             // Sum up bytes of code (rough approximation)
//             return Object.values(languages).reduce((sum: number, bytes) => sum + (bytes as number), 0)
//           } catch (error) {
//             console.log(`Could not fetch languages for ${repo.name}:`, error)
//             return 0
//           }
//         })

//         const languageCounts = await Promise.all(languagePromises)
//         const totalBytes = languageCounts.reduce((sum, count) => sum + count, 0)

//         // Convert bytes to approximate lines (average ~50 characters per line)
//         totalLinesOfCode = Math.floor(totalBytes / 50)

//         // Get total commits using direct repo scanning for maximum accuracy
//         let totalCommits = 0

//         try {
//           // Method 1: Get contributions from GraphQL (for baseline)
//           const currentYear = new Date().getFullYear()
//           const startYear = 2019

//           let graphqlTotal = 0

//           for (let year = startYear; year <= currentYear; year++) {
//             try {
//               const contributionsQuery = `
//                 query($username: String!, $from: DateTime!, $to: DateTime!) {
//                   user(login: $username) {
//                     contributionsCollection(from: $from, to: $to) {
//                       totalCommitContributions
//                     }
//                   }
//                 }
//               `

//               const contributionsResult = await octokit.graphql<GraphQLResponse>(contributionsQuery, {
//                 username: "vedantkesharia",
//                 from: `${year}-01-01T00:00:00Z`,
//                 to: `${year}-12-31T23:59:59Z`,
//               })

//               graphqlTotal += contributionsResult.user.contributionsCollection.totalCommitContributions
//             } catch (yearError) {
//               console.log(`Failed to get commits for year ${year}:`, yearError)
//             }
//           }

//           // Method 2: Manual count from repositories (more accurate)
//           let manualTotal = 0

//           // Get all repos including private ones if token has access
//           const allRepos = await octokit.paginate(octokit.rest.repos.listForUser, {
//             username: "vedantkesharia",
//             type: "all", // includes private repos
//             per_page: 100,
//           })

//           console.log(`Found ${allRepos.length} total repositories`)

//           // Count commits from each repo (limit to avoid rate limits)
//           const commitPromises = allRepos.map(async (repo) => {
//             try {
//               // Get total commit count using different approach
//               const commits = await octokit.paginate(
//                 octokit.rest.repos.listCommits,
//                 {
//                   owner: "vedantkesharia",
//                   repo: repo.name,
//                   author: "vedantkesharia",
//                   per_page: 100,
//                 },
//                 (response) => response.data,
//               )

//               console.log(`${repo.name}: ${commits.length} commits`)
//               return commits.length
//             } catch (error) {
//               // If we can't access repo, try without author filter
//               try {
//                 const { data: commits } = await octokit.rest.repos.listCommits({
//                   owner: "vedantkesharia",
//                   repo: repo.name,
//                   per_page: 100,
//                 })

//                 // Filter commits by author manually
//                 const myCommits = commits.filter(
//                   (commit) =>
//                     commit.author?.login === "vedantkesharia" || commit.commit.author?.email?.includes("vedant"), // adjust email pattern
//                 )

//                 console.log(`${repo.name}: ${myCommits.length} commits (filtered)`)
//                 return myCommits.length
//               } catch (innerError) {
//                 console.log(`Could not access ${repo.name}:`, innerError)
//                 return 0
//               }
//             }
//           })

//           const commitCounts = await Promise.all(commitPromises)
//           manualTotal = commitCounts.reduce((sum, count) => sum + count, 0)

//           console.log(`GraphQL total: ${graphqlTotal}`)
//           console.log(`Manual count total: ${manualTotal}`)

//           // Use the higher count and add a small buffer for missed commits
//           totalCommits = Math.max(graphqlTotal, manualTotal)

//           // If still seems low, add estimated buffer for private/missed commits
//           if (totalCommits < 700) {
//             totalCommits = Math.floor(totalCommits * 1.1) // Add 10% buffer
//             console.log(`Applied buffer, final count: ${totalCommits}`)
//           }
//         } catch (error) {
//           console.log("GraphQL failed, falling back to REST API estimation")

//           // Fallback: Get commits from more repos but with pagination
//           const commitPromises = repos.slice(0, 20).map(async (repo) => {
//             try {
//               // Get first page to check total count
//               const { data: commits } = await octokit.rest.repos.listCommits({
//                 owner: "vedantkesharia",
//                 repo: repo.name,
//                 author: "vedantkesharia",
//                 per_page: 1,
//               })

//               // Estimate total commits (this is still limited by API)
//               if (commits.length > 0) {
//                 // Try to get a better estimate by checking commit history
//                 const { data: allCommits } = await octokit.rest.repos.listCommits({
//                   owner: "vedantkesharia",
//                   repo: repo.name,
//                   author: "vedantkesharia",
//                   per_page: 100,
//                 })
//                 return allCommits.length
//               }
//               return 0
//             } catch (error) {
//               console.log(`Could not fetch commits for ${repo.name}:`, error)
//               return 0
//             }
//           })

//           const commitCounts = await Promise.all(commitPromises)
//           totalCommits = commitCounts.reduce((sum, count) => sum + count, 0)

//           // Add estimation multiplier since we're likely undercounting
//           totalCommits = Math.floor(totalCommits * 1.5) // Conservative estimate
//         }

//         setGithubStats({
//           totalRepos: repos.length,
//           totalCommits,
//           totalLinesOfCode,
//           loading: false,
//         })
//       } catch (error) {
//         console.error("Error fetching GitHub stats:", error)
//         // Fallback to mock data if API fails
//         setGithubStats({
//           totalRepos: 42,
//           totalCommits: 1250,
//           totalLinesOfCode: 50000,
//           loading: false,
//         })
//       }
//     }

//     const fetchLeetCodeStats = async () => {
//       try {
//         // Try multiple LeetCode API endpoints
//         let data = null

//         // Primary API
//         try {
//           const response = await fetch(`https://leetcode-stats-api.herokuapp.com/vedantkesharia`)
//           if (response.ok) {
//             data = await response.json()
//           }
//         } catch (error) {
//           console.log("Primary LeetCode API failed:", error)
//         }

//         // Fallback API
//         if (!data) {
//           try {
//             const response = await fetch(`https://alfa-leetcode-api.onrender.com/vedantkesharia/solved`)
//             if (response.ok) {
//               data = await response.json()
//             }
//           } catch (error) {
//             console.log("Fallback LeetCode API failed:", error)
//           }
//         }

//         // Another fallback API
//         if (!data) {
//           try {
//             const response = await fetch(`https://leetcode-api-faisalshohag.vercel.app/vedantkesharia`)
//             if (response.ok) {
//               data = await response.json()
//             }
//           } catch (error) {
//             console.log("Second fallback LeetCode API failed:", error)
//           }
//         }

//         setLeetcodeStats({
//           totalSolved: data?.totalSolved || data?.solvedProblem || data?.solved || 150, // Multiple field checks
//           loading: false,
//         })
//       } catch (error) {
//         console.error("Error fetching LeetCode stats:", error)
//         // Fallback data
//         setLeetcodeStats({
//           totalSolved: 150, // Replace with your actual count
//           loading: false,
//         })
//       }
//     }

//     fetchGitHubStats()
//     fetchLeetCodeStats()
//   }, [])

//   const scrollToSection = (sectionId: string) => {
//     document.getElementById(sectionId)?.scrollIntoView({
//       behavior: "smooth",
//       block: "start",
//     })
//   }

//   return (
//     <section id="about" className="py-32 relative overflow-hidden">
//       {/* Subtle background gradient */}
//       <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/50 to-black" />

//       <div className="max-w-6xl mx-auto px-6 relative z-10">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           className="text-center mb-20"
//         >
//           <h2 className="text-6xl font-light mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
//             About Me
//           </h2>
//           <div className="w-64 h-px bg-gradient-to-r from-transparent via-white to-transparent mx-auto" />
//         </motion.div>

//         {/* Main Content - Stacked Layout */}
//         <div className="space-y-20">

//           {/* Personal Statement - Full Width */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.2 }}
//             className="text-center max-w-4xl mx-auto space-y-8"
//           >
//             <div className="space-y-6">
//               <p className="text-2xl text-gray-300 leading-relaxed font-light">
//                 I'm a passionate Full-Stack AI Engineer pursuing my Master's in Computer Science at
//                 <span className="text-white font-medium"> University of Colorado Boulder</span>.
//               </p>
//               <p className="text-xl text-gray-400 leading-relaxed">
//                 I specialize in building intelligent systems that bridge the gap between cutting-edge AI research and
//                 practical applications, with a focus on creating meaningful impact through technology.
//               </p>
//             </div>

//             {/* CTA Buttons */}
//             <div className="flex gap-4 justify-center pt-4">
//               <motion.button
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 className="px-8 py-3 bg-white text-black font-medium hover:bg-gray-100 transition-all duration-300 rounded-sm"
//               >
//                 Download Resume
//               </motion.button>
//               <motion.button
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 onClick={() => scrollToSection("contact")}
//                 className="px-8 py-3 border border-gray-600 text-gray-300 hover:border-white hover:text-white transition-all duration-300 rounded-sm"
//               >
//                 Let's Connect
//               </motion.button>
//             </div>
//           </motion.div>

//           {/* Development Stats Section */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.4 }}
//             className="space-y-12"
//           >
//             {/* Stats Header */}
//             <div className="text-center">
//               <h3 className="text-sm text-gray-500 uppercase tracking-widest mb-8">Development Stats</h3>
//             </div>

//             {/* Stats Grid */}
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
//               {/* GitHub Repos */}
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 whileInView={{ opacity: 1, scale: 1 }}
//                 transition={{ duration: 0.6, delay: 0.6 }}
//                 className="text-center p-6 rounded-lg bg-gray-900/40 border border-gray-800 hover:bg-gray-900/60 hover:border-gray-700 transition-all duration-300"
//               >
//                 <div className="text-3xl font-light text-white mb-2">
//                   {githubStats.loading ? (
//                     <div className="animate-pulse bg-gray-700 h-8 w-12 mx-auto rounded"></div>
//                   ) : (
//                     githubStats.totalRepos
//                   )}
//                 </div>
//                 <div className="text-xs text-gray-400 uppercase tracking-wider">GitHub Repos</div>
//               </motion.div>

//               {/* Total Commits */}
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 whileInView={{ opacity: 1, scale: 1 }}
//                 transition={{ duration: 0.6, delay: 0.7 }}
//                 className="text-center p-6 rounded-lg bg-gray-900/40 border border-gray-800 hover:bg-gray-900/60 hover:border-gray-700 transition-all duration-300"
//               >
//                 <div className="text-3xl font-light text-white mb-2">
//                   {githubStats.loading ? (
//                     <div className="animate-pulse bg-gray-700 h-8 w-12 mx-auto rounded"></div>
//                   ) : (
//                     `${githubStats.totalCommits}+`
//                   )}
//                 </div>
//                 <div className="text-xs text-gray-400 uppercase tracking-wider">Total Commits</div>
//               </motion.div>

//               {/* Lines of Code */}
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 whileInView={{ opacity: 1, scale: 1 }}
//                 transition={{ duration: 0.6, delay: 0.8 }}
//                 className="text-center p-6 rounded-lg bg-gray-900/40 border border-gray-800 hover:bg-gray-900/60 hover:border-gray-700 transition-all duration-300"
//               >
//                 <div className="text-3xl font-light text-white mb-2">
//                   {githubStats.loading ? (
//                     <div className="animate-pulse bg-gray-700 h-8 w-12 mx-auto rounded"></div>
//                   ) : (
//                     `${Math.floor(githubStats.totalLinesOfCode / 1000)}K`
//                   )}
//                 </div>
//                 <div className="text-xs text-gray-400 uppercase tracking-wider">Lines of Code</div>
//               </motion.div>

//               {/* LeetCode Solved */}
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 whileInView={{ opacity: 1, scale: 1 }}
//                 transition={{ duration: 0.6, delay: 0.9 }}
//                 className="text-center p-6 rounded-lg bg-gray-900/40 border border-gray-800 hover:bg-gray-900/60 hover:border-gray-700 transition-all duration-300"
//               >
//                 <div className="text-3xl font-light text-white mb-2">
//                   {leetcodeStats.loading ? (
//                     <div className="animate-pulse bg-gray-700 h-8 w-12 mx-auto rounded"></div>
//                   ) : (
//                     `${leetcodeStats.totalSolved}+`
//                   )}
//                 </div>
//                 <div className="text-xs text-gray-400 uppercase tracking-wider">LeetCode Solved</div>
//               </motion.div>
//             </div>

//             {/* Research Papers Stat - Full Width */}
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }}
//               whileInView={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 0.6, delay: 1.0 }}
//               className="group relative max-w-md mx-auto"
//             >
//               <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 rounded-lg opacity-40 group-hover:opacity-70 transition duration-300 blur-sm"></div>
//               <div className="relative text-center p-8 rounded-lg bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-sm border border-purple-700/30 group-hover:border-purple-600/50 transition-all duration-300">
//                 <div className="text-4xl font-light text-white mb-2">8</div>
//                 <div className="text-sm text-gray-300 uppercase tracking-wider">Research Papers Published</div>
//                 <div className="mt-2 w-12 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent mx-auto"></div>
//               </div>
//             </motion.div>
//           </motion.div>

//           {/* Background Section */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.6 }}
//             className="space-y-8"
//           >
//             <div className="text-center mb-8">
//               <h3 className="text-sm text-gray-500 uppercase tracking-widest">Background</h3>
//             </div>

//             <div className="space-y-6 max-w-3xl mx-auto">
//               {/* Education */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 1.1 }}
//                 className="group"
//               >
//                 <div className="flex items-start space-x-4 p-6 rounded-lg hover:bg-gray-900/20 transition-all duration-300 border-l-2 border-gray-800 hover:border-gray-600">
//                   <div className="flex-1">
//                     <h3 className="text-lg font-medium text-white mb-2 group-hover:text-gray-100 transition-colors">
//                       Education
//                     </h3>
//                     <div className="space-y-2">
//                       <p className="text-gray-300 text-sm">MS Computer Science • University of Colorado Boulder</p>
//                       <p className="text-gray-400 text-sm">BTech IT • DJ Sanghvi College • 8.52 CGPA</p>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Research */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 1.2 }}
//                 className="group"
//               >
//                 <div className="flex items-start space-x-4 p-6 rounded-lg hover:bg-gray-900/20 transition-all duration-300 border-l-2 border-gray-800 hover:border-gray-600">
//                   <div className="flex-1">
//                     <h3 className="text-lg font-medium text-white mb-2 group-hover:text-gray-100 transition-colors">
//                       Research
//                     </h3>
//                     <div className="space-y-2">
//                       <p className="text-gray-300 text-sm">8 Published Papers • International Journals</p>
//                       <p className="text-gray-400 text-sm">Patent Applied • ML Scheduling Algorithms</p>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Leadership */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 1.3 }}
//                 className="group"
//               >
//                 <div className="flex items-start space-x-4 p-6 rounded-lg hover:bg-gray-900/20 transition-all duration-300 border-l-2 border-gray-800 hover:border-gray-600">
//                   <div className="flex-1">
//                     <h3 className="text-lg font-medium text-white mb-2 group-hover:text-gray-100 transition-colors">
//                       Leadership
//                     </h3>
//                     <div className="space-y-2">
//                       <p className="text-gray-300 text-sm">Vice Chairperson • DJ Init.AI Club</p>
//                       <p className="text-gray-400 text-sm">Research Intern • USC & IIT Patna</p>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             </div>
//           </motion.div>

//         </div>

//         {/* Bottom Accent */}
//         <motion.div
//           initial={{ opacity: 0, scaleX: 0 }}
//           whileInView={{ opacity: 1, scaleX: 1 }}
//           transition={{ duration: 1, delay: 1.4 }}
//           className="mt-20 pt-12 border-t border-gray-800"
//         >
//           <div className="text-center">
//             <p className="text-sm text-gray-500 uppercase tracking-widest">Building the future with AI & Innovation</p>
//           </div>
//         </motion.div>
//       </div>
//     </section>
//   )
// }

// "use client"
// import { motion } from "framer-motion"
// import { useEffect, useState } from "react"
// import { Octokit } from "@octokit/rest"

// interface GitHubStats {
//   totalRepos: number
//   totalCommits: number
//   totalLinesOfCode: number
//   loading: boolean
// }

// interface LeetCodeStats {
//   totalSolved: number
//   loading: boolean
// }

// interface GraphQLResponse {
//   user: {
//     contributionsCollection: {
//       totalCommitContributions: number
//     }
//   }
// }

// export function AboutSection() {
//   const [githubStats, setGithubStats] = useState<GitHubStats>({
//     totalRepos: 0,
//     totalCommits: 0,
//     totalLinesOfCode: 0,
//     loading: true,
//   })

//   const [leetcodeStats, setLeetcodeStats] = useState<LeetCodeStats>({
//     totalSolved: 0,
//     loading: true,
//   })

//   useEffect(() => {
//     const fetchGitHubStats = async () => {
//       try {
//         const octokit = new Octokit({
//           auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN,
//         })

//         // Get all public repositories
//         const { data: repos } = await octokit.rest.repos.listForUser({
//           username: "vedantkesharia",
//           per_page: 100,
//         })

//         // Calculate total lines of code (approximation using language stats)
//         let totalLinesOfCode = 0

//         const languagePromises = repos.slice(0, 15).map(async (repo) => {
//           try {
//             const { data: languages } = await octokit.rest.repos.listLanguages({
//               owner: "vedantkesharia",
//               repo: repo.name,
//             })

//             // Sum up bytes of code (rough approximation)
//             return Object.values(languages).reduce((sum: number, bytes) => sum + (bytes as number), 0)
//           } catch (error) {
//             console.log(`Could not fetch languages for ${repo.name}:`, error)
//             return 0
//           }
//         })

//         const languageCounts = await Promise.all(languagePromises)
//         const totalBytes = languageCounts.reduce((sum, count) => sum + count, 0)

//         // Convert bytes to approximate lines (average ~50 characters per line)
//         totalLinesOfCode = Math.floor(totalBytes / 50)

//         // Get total commits using direct repo scanning for maximum accuracy
//         let totalCommits = 0

//         try {
//           // Method 1: Get contributions from GraphQL (for baseline)
//           const currentYear = new Date().getFullYear()
//           const startYear = 2019

//           let graphqlTotal = 0

//           for (let year = startYear; year <= currentYear; year++) {
//             try {
//               const contributionsQuery = `
//                 query($username: String!, $from: DateTime!, $to: DateTime!) {
//                   user(login: $username) {
//                     contributionsCollection(from: $from, to: $to) {
//                       totalCommitContributions
//                     }
//                   }
//                 }
//               `

//               const contributionsResult = await octokit.graphql<GraphQLResponse>(contributionsQuery, {
//                 username: "vedantkesharia",
//                 from: `${year}-01-01T00:00:00Z`,
//                 to: `${year}-12-31T23:59:59Z`,
//               })

//               graphqlTotal += contributionsResult.user.contributionsCollection.totalCommitContributions
//             } catch (yearError) {
//               console.log(`Failed to get commits for year ${year}:`, yearError)
//             }
//           }

//           // Method 2: Manual count from repositories (more accurate)
//           let manualTotal = 0

//           // Get all repos including private ones if token has access
//           const allRepos = await octokit.paginate(octokit.rest.repos.listForUser, {
//             username: "vedantkesharia",
//             type: "all", // includes private repos
//             per_page: 100,
//           })

//           console.log(`Found ${allRepos.length} total repositories`)

//           // Count commits from each repo (limit to avoid rate limits)
//           const commitPromises = allRepos.map(async (repo) => {
//             try {
//               // Get total commit count using different approach
//               const commits = await octokit.paginate(
//                 octokit.rest.repos.listCommits,
//                 {
//                   owner: "vedantkesharia",
//                   repo: repo.name,
//                   author: "vedantkesharia",
//                   per_page: 100,
//                 },
//                 (response) => response.data,
//               )

//               console.log(`${repo.name}: ${commits.length} commits`)
//               return commits.length
//             } catch (error) {
//               // If we can't access repo, try without author filter
//               try {
//                 const { data: commits } = await octokit.rest.repos.listCommits({
//                   owner: "vedantkesharia",
//                   repo: repo.name,
//                   per_page: 100,
//                 })

//                 // Filter commits by author manually
//                 const myCommits = commits.filter(
//                   (commit) =>
//                     commit.author?.login === "vedantkesharia" || commit.commit.author?.email?.includes("vedant"), // adjust email pattern
//                 )

//                 console.log(`${repo.name}: ${myCommits.length} commits (filtered)`)
//                 return myCommits.length
//               } catch (innerError) {
//                 console.log(`Could not access ${repo.name}:`, innerError)
//                 return 0
//               }
//             }
//           })

//           const commitCounts = await Promise.all(commitPromises)
//           manualTotal = commitCounts.reduce((sum, count) => sum + count, 0)

//           console.log(`GraphQL total: ${graphqlTotal}`)
//           console.log(`Manual count total: ${manualTotal}`)

//           // Use the higher count and add a small buffer for missed commits
//           totalCommits = Math.max(graphqlTotal, manualTotal)

//           // If still seems low, add estimated buffer for private/missed commits
//           if (totalCommits < 700) {
//             totalCommits = Math.floor(totalCommits * 1.1) // Add 10% buffer
//             console.log(`Applied buffer, final count: ${totalCommits}`)
//           }
//         } catch (error) {
//           console.log("GraphQL failed, falling back to REST API estimation")

//           // Fallback: Get commits from more repos but with pagination
//           const commitPromises = repos.slice(0, 20).map(async (repo) => {
//             try {
//               // Get first page to check total count
//               const { data: commits } = await octokit.rest.repos.listCommits({
//                 owner: "vedantkesharia",
//                 repo: repo.name,
//                 author: "vedantkesharia",
//                 per_page: 1,
//               })

//               // Estimate total commits (this is still limited by API)
//               if (commits.length > 0) {
//                 // Try to get a better estimate by checking commit history
//                 const { data: allCommits } = await octokit.rest.repos.listCommits({
//                   owner: "vedantkesharia",
//                   repo: repo.name,
//                   author: "vedantkesharia",
//                   per_page: 100,
//                 })
//                 return allCommits.length
//               }
//               return 0
//             } catch (error) {
//               console.log(`Could not fetch commits for ${repo.name}:`, error)
//               return 0
//             }
//           })

//           const commitCounts = await Promise.all(commitPromises)
//           totalCommits = commitCounts.reduce((sum, count) => sum + count, 0)

//           // Add estimation multiplier since we're likely undercounting
//           totalCommits = Math.floor(totalCommits * 1.5) // Conservative estimate
//         }

//         setGithubStats({
//           totalRepos: repos.length,
//           totalCommits,
//           totalLinesOfCode,
//           loading: false,
//         })
//       } catch (error) {
//         console.error("Error fetching GitHub stats:", error)
//         // Fallback to mock data if API fails
//         setGithubStats({
//           totalRepos: 42,
//           totalCommits: 1250,
//           totalLinesOfCode: 50000,
//           loading: false,
//         })
//       }
//     }

//     const fetchLeetCodeStats = async () => {
//       try {
//         // LeetCode API endpoint (unofficial)
//         const response = await fetch(`https://leetcode-stats-api.herokuapp.com/vedantkesharia`)
//         const data = await response.json()

//         setLeetcodeStats({
//           totalSolved: data.totalSolved || 0,
//           loading: false,
//         })
//       } catch (error) {
//         console.error("Error fetching LeetCode stats:", error)
//         // Fallback data
//         setLeetcodeStats({
//           totalSolved: 150, // Replace with your actual count
//           loading: false,
//         })
//       }
//     }

//     fetchGitHubStats()
//     fetchLeetCodeStats()
//   }, [])

//   const scrollToSection = (sectionId: string) => {
//     document.getElementById(sectionId)?.scrollIntoView({
//       behavior: "smooth",
//       block: "start",
//     })
//   }

//   return (
//     <section id="about" className="py-32 relative overflow-hidden">
//       {/* Subtle background gradient */}
//       <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/50 to-black" />

//       <div className="max-w-6xl mx-auto px-6 relative z-10">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           className="text-center mb-20"
//         >
//           <h2 className="text-6xl font-light mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
//             About Me
//           </h2>
//           <div className="w-64 h-px bg-gradient-to-r from-transparent via-white to-transparent mx-auto" />
//         </motion.div>

//         {/* Main Content */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
//           {/* Left: Personal Statement */}
//           <motion.div
//             initial={{ opacity: 0, x: -50 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.8, delay: 0.2 }}
//             className="space-y-8"
//           >
//             <div className="space-y-6">
//               <p className="text-xl text-gray-300 leading-relaxed font-light">
//                 I'm a passionate Full-Stack AI Engineer pursuing my Master's in Computer Science at
//                 <span className="text-white font-medium"> University of Colorado Boulder</span>.
//               </p>
//               <p className="text-lg text-gray-400 leading-relaxed">
//                 I specialize in building intelligent systems that bridge the gap between cutting-edge AI research and
//                 practical applications, with a focus on creating meaningful impact through technology.
//               </p>
//             </div>

//             {/* CTA Buttons */}
//             <div className="flex gap-4 pt-4">
//               <motion.button
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 className="px-8 py-3 bg-white text-black font-medium hover:bg-gray-100 transition-all duration-300 rounded-sm"
//               >
//                 Download Resume
//               </motion.button>
//               <motion.button
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 onClick={() => scrollToSection("contact")}
//                 className="px-8 py-3 border border-gray-600 text-gray-300 hover:border-white hover:text-white transition-all duration-300 rounded-sm"
//               >
//                 Let's Connect
//               </motion.button>
//             </div>
//           </motion.div>

//           {/* Right: Stats & Highlights */}
//           <motion.div
//             initial={{ opacity: 0, x: 50 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.8, delay: 0.4 }}
//             className="space-y-12"
//           >
//             {/* Stats Grid */}
//             <div className="space-y-8">
//               {/* GitHub Stats Label */}
//               <div className="text-center">
//                 <h3 className="text-sm text-gray-500 uppercase tracking-widest mb-6">Development Stats</h3>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 {/* GitHub Repos */}
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   whileInView={{ opacity: 1, scale: 1 }}
//                   transition={{ duration: 0.6, delay: 0.6 }}
//                   className="text-center p-5 rounded-lg bg-gray-900/40 border border-gray-800 hover:bg-gray-900/60 hover:border-gray-700 transition-all duration-300"
//                 >
//                   <div className="text-3xl font-light text-white mb-2">
//                     {githubStats.loading ? (
//                       <div className="animate-pulse bg-gray-700 h-8 w-12 mx-auto rounded"></div>
//                     ) : (
//                       githubStats.totalRepos
//                     )}
//                   </div>
//                   <div className="text-xs text-gray-400 uppercase tracking-wider">GitHub Repos</div>
//                 </motion.div>

//                 {/* Total Commits */}
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   whileInView={{ opacity: 1, scale: 1 }}
//                   transition={{ duration: 0.6, delay: 0.7 }}
//                   className="text-center p-5 rounded-lg bg-gray-900/40 border border-gray-800 hover:bg-gray-900/60 hover:border-gray-700 transition-all duration-300"
//                 >
//                   <div className="text-3xl font-light text-white mb-2">
//                     {githubStats.loading ? (
//                       <div className="animate-pulse bg-gray-700 h-8 w-12 mx-auto rounded"></div>
//                     ) : (
//                       `${githubStats.totalCommits}+`
//                     )}
//                   </div>
//                   <div className="text-xs text-gray-400 uppercase tracking-wider">Total Commits</div>
//                 </motion.div>

//                 {/* Lines of Code */}
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   whileInView={{ opacity: 1, scale: 1 }}
//                   transition={{ duration: 0.6, delay: 0.8 }}
//                   className="text-center p-5 rounded-lg bg-gray-900/40 border border-gray-800 hover:bg-gray-900/60 hover:border-gray-700 transition-all duration-300"
//                 >
//                   <div className="text-3xl font-light text-white mb-2">
//                     {githubStats.loading ? (
//                       <div className="animate-pulse bg-gray-700 h-8 w-12 mx-auto rounded"></div>
//                     ) : (
//                       `${Math.floor(githubStats.totalLinesOfCode / 1000)}K`
//                     )}
//                   </div>
//                   <div className="text-xs text-gray-400 uppercase tracking-wider">Lines of Code</div>
//                 </motion.div>

//                 {/* LeetCode Solved */}
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   whileInView={{ opacity: 1, scale: 1 }}
//                   transition={{ duration: 0.6, delay: 0.9 }}
//                   className="text-center p-5 rounded-lg bg-gray-900/40 border border-gray-800 hover:bg-gray-900/60 hover:border-gray-700 transition-all duration-300"
//                 >
//                   <div className="text-3xl font-light text-white mb-2">
//                     {leetcodeStats.loading ? (
//                       <div className="animate-pulse bg-gray-700 h-8 w-12 mx-auto rounded"></div>
//                     ) : (
//                       `${leetcodeStats.totalSolved}+`
//                     )}
//                   </div>
//                   <div className="text-xs text-gray-400 uppercase tracking-wider">LeetCode Solved</div>
//                 </motion.div>
//               </div>

//               {/* Research Papers Stat */}
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 whileInView={{ opacity: 1, scale: 1 }}
//                 transition={{ duration: 0.6, delay: 1.0 }}
//                 className="group relative"
//               >
//                 <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 rounded-lg opacity-40 group-hover:opacity-70 transition duration-300 blur-sm"></div>
//                 <div className="relative text-center p-6 rounded-lg bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-sm border border-purple-700/30 group-hover:border-purple-600/50 transition-all duration-300">
//                   <div className="text-4xl font-light text-white mb-2">8</div>
//                   <div className="text-sm text-gray-300 uppercase tracking-wider">Research Papers Published</div>
//                   <div className="mt-2 w-12 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent mx-auto"></div>
//                 </div>
//               </motion.div>
//             </div>

//             {/* Key Highlights - Minimalist Design */}
//             <div className="space-y-4">
//               <div className="text-center mb-6">
//                 <h3 className="text-sm text-gray-500 uppercase tracking-widest">Background</h3>
//               </div>

//               {/* Education */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 1.1 }}
//                 className="group"
//               >
//                 <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-900/20 transition-all duration-300 border-l-2 border-gray-800 hover:border-gray-600">
//                   <div className="flex-1">
//                     <h3 className="text-lg font-medium text-white mb-1 group-hover:text-gray-100 transition-colors">
//                       Education
//                     </h3>
//                     <div className="space-y-1">
//                       <p className="text-gray-300 text-sm">MS Computer Science • University of Colorado Boulder</p>
//                       <p className="text-gray-400 text-sm">BTech IT • DJ Sanghvi College • 8.52 CGPA</p>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Research */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 1.2 }}
//                 className="group"
//               >
//                 <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-900/20 transition-all duration-300 border-l-2 border-gray-800 hover:border-gray-600">
//                   <div className="flex-1">
//                     <h3 className="text-lg font-medium text-white mb-1 group-hover:text-gray-100 transition-colors">
//                       Research
//                     </h3>
//                     <div className="space-y-1">
//                       <p className="text-gray-300 text-sm">8 Published Papers • International Journals</p>
//                       <p className="text-gray-400 text-sm">Patent Applied • ML Scheduling Algorithms</p>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Leadership */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 1.3 }}
//                 className="group"
//               >
//                 <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-900/20 transition-all duration-300 border-l-2 border-gray-800 hover:border-gray-600">
//                   <div className="flex-1">
//                     <h3 className="text-lg font-medium text-white mb-1 group-hover:text-gray-100 transition-colors">
//                       Leadership
//                     </h3>
//                     <div className="space-y-1">
//                       <p className="text-gray-300 text-sm">Vice Chairperson • DJ Init.AI Club</p>
//                       <p className="text-gray-400 text-sm">Research Intern • USC & IIT Patna</p>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             </div>
//           </motion.div>
//         </div>

//         {/* Bottom Accent */}
//         <motion.div
//           initial={{ opacity: 0, scaleX: 0 }}
//           whileInView={{ opacity: 1, scaleX: 1 }}
//           transition={{ duration: 1, delay: 1.4 }}
//           className="mt-20 pt-12 border-t border-gray-800"
//         >
//           <div className="text-center">
//             <p className="text-sm text-gray-500 uppercase tracking-widest">Building the future with AI & Innovation</p>
//           </div>
//         </motion.div>
//       </div>
//     </section>
//   )
// }

// "use client"
// import { motion } from "framer-motion"
// import { useEffect, useState } from "react"
// import { Octokit } from "@octokit/rest"

// interface GitHubStats {
//   totalRepos: number
//   totalCommits: number
//   totalLinesOfCode: number
//   loading: boolean
// }

// interface GraphQLResponse {
//   user: {
//     contributionsCollection: {
//       totalCommitContributions: number
//     }
//   }
// }

// export function AboutSection() {
//   const [githubStats, setGithubStats] = useState<GitHubStats>({
//     totalRepos: 0,
//     totalCommits: 0,
//     totalLinesOfCode: 0,
//     loading: true,
//   })

//   useEffect(() => {
//     const fetchGitHubStats = async () => {
//       try {
//         const octokit = new Octokit({
//           auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN
//         })

//         // Get all public repositories
//         const { data: repos } = await octokit.rest.repos.listForUser({
//           username: 'vedantkesharia',
//           per_page: 100
//         })

//         // Calculate total lines of code (approximation using language stats)
//         let totalLinesOfCode = 0

//         const languagePromises = repos.slice(0, 15).map(async (repo) => {
//           try {
//             const { data: languages } = await octokit.rest.repos.listLanguages({
//               owner: 'vedantkesharia',
//               repo: repo.name
//             })

//             // Sum up bytes of code (rough approximation)
//             return Object.values(languages).reduce((sum: number, bytes) => sum + (bytes as number), 0)
//           } catch (error) {
//             console.log(`Could not fetch languages for ${repo.name}:`, error)
//             return 0
//           }
//         })

//         const languageCounts = await Promise.all(languagePromises)
//         const totalBytes = languageCounts.reduce((sum, count) => sum + count, 0)

//         // Convert bytes to approximate lines (average ~50 characters per line)
//         totalLinesOfCode = Math.floor(totalBytes / 50)

//         // Get total commits using direct repo scanning for maximum accuracy
//         let totalCommits = 0

//         try {
//           // Method 1: Get contributions from GraphQL (for baseline)
//           const currentYear = new Date().getFullYear()
//           const startYear = 2019

//           let graphqlTotal = 0

//           for (let year = startYear; year <= currentYear; year++) {
//             try {
//               const contributionsQuery = `
//                 query($username: String!, $from: DateTime!, $to: DateTime!) {
//                   user(login: $username) {
//                     contributionsCollection(from: $from, to: $to) {
//                       totalCommitContributions
//                     }
//                   }
//                 }
//               `

//               const contributionsResult = await octokit.graphql<GraphQLResponse>(contributionsQuery, {
//                 username: 'vedantkesharia',
//                 from: `${year}-01-01T00:00:00Z`,
//                 to: `${year}-12-31T23:59:59Z`
//               })

//               graphqlTotal += contributionsResult.user.contributionsCollection.totalCommitContributions
//             } catch (yearError) {
//               console.log(`Failed to get commits for year ${year}:`, yearError)
//             }
//           }

//           // Method 2: Manual count from repositories (more accurate)
//           let manualTotal = 0

//           // Get all repos including private ones if token has access
//           const allRepos = await octokit.paginate(octokit.rest.repos.listForUser, {
//             username: 'vedantkesharia',
//             type: 'all', // includes private repos
//             per_page: 100
//           })

//           console.log(`Found ${allRepos.length} total repositories`)

//           // Count commits from each repo (limit to avoid rate limits)
//           const commitPromises = allRepos.map(async (repo) => {
//             try {
//               // Get total commit count using different approach
//               const commits = await octokit.paginate(octokit.rest.repos.listCommits, {
//                 owner: 'vedantkesharia',
//                 repo: repo.name,
//                 author: 'vedantkesharia',
//                 per_page: 100
//               }, (response) => response.data)

//               console.log(`${repo.name}: ${commits.length} commits`)
//               return commits.length
//             } catch (error) {
//               // If we can't access repo, try without author filter
//               try {
//                 const { data: commits } = await octokit.rest.repos.listCommits({
//                   owner: 'vedantkesharia',
//                   repo: repo.name,
//                   per_page: 100
//                 })

//                 // Filter commits by author manually
//                 const myCommits = commits.filter(commit =>
//                   commit.author?.login === 'vedantkesharia' ||
//                   commit.commit.author?.email?.includes('vedant') // adjust email pattern
//                 )

//                 console.log(`${repo.name}: ${myCommits.length} commits (filtered)`)
//                 return myCommits.length
//               } catch (innerError) {
//                 console.log(`Could not access ${repo.name}:`, innerError)
//                 return 0
//               }
//             }
//           })

//           const commitCounts = await Promise.all(commitPromises)
//           manualTotal = commitCounts.reduce((sum, count) => sum + count, 0)

//           console.log(`GraphQL total: ${graphqlTotal}`)
//           console.log(`Manual count total: ${manualTotal}`)

//           // Use the higher count and add a small buffer for missed commits
//           totalCommits = Math.max(graphqlTotal, manualTotal)

//           // If still seems low, add estimated buffer for private/missed commits
//           if (totalCommits < 700) {
//             totalCommits = Math.floor(totalCommits * 1.1) // Add 10% buffer
//             console.log(`Applied buffer, final count: ${totalCommits}`)
//           }
//         } catch (error) {
//           console.log('GraphQL failed, falling back to REST API estimation')

//           // Fallback: Get commits from more repos but with pagination
//           const commitPromises = repos.slice(0, 20).map(async (repo) => {
//             try {
//               // Get first page to check total count
//               const { data: commits } = await octokit.rest.repos.listCommits({
//                 owner: 'vedantkesharia',
//                 repo: repo.name,
//                 author: 'vedantkesharia',
//                 per_page: 1
//               })

//               // Estimate total commits (this is still limited by API)
//               if (commits.length > 0) {
//                 // Try to get a better estimate by checking commit history
//                 const { data: allCommits } = await octokit.rest.repos.listCommits({
//                   owner: 'vedantkesharia',
//                   repo: repo.name,
//                   author: 'vedantkesharia',
//                   per_page: 100
//                 })
//                 return allCommits.length
//               }
//               return 0
//             } catch (error) {
//               console.log(`Could not fetch commits for ${repo.name}:`, error)
//               return 0
//             }
//           })

//           const commitCounts = await Promise.all(commitPromises)
//           totalCommits = commitCounts.reduce((sum, count) => sum + count, 0)

//           // Add estimation multiplier since we're likely undercounting
//           totalCommits = Math.floor(totalCommits * 1.5) // Conservative estimate
//         }

//         setGithubStats({
//           totalRepos: repos.length,
//           totalCommits,
//           totalLinesOfCode,
//           loading: false,
//         })
//       } catch (error) {
//         console.error('Error fetching GitHub stats:', error)
//         // Fallback to mock data if API fails
//         setGithubStats({
//           totalRepos: 42,
//           totalCommits: 1250,
//           totalLinesOfCode: 50000,
//           loading: false,
//         })
//       }
//     }

//     fetchGitHubStats()
//   }, [])

//   const scrollToSection = (sectionId: string) => {
//     document.getElementById(sectionId)?.scrollIntoView({
//       behavior: "smooth",
//       block: "start",
//     })
//   }

//   return (
//     <section id="about" className="py-32 relative overflow-hidden">
//       {/* Subtle background gradient */}
//       <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/50 to-black" />

//       <div className="max-w-6xl mx-auto px-6 relative z-10">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           className="text-center mb-20"
//         >
//           <h2 className="text-6xl font-light mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
//             About Me
//           </h2>
//           <div className="w-64 h-px bg-gradient-to-r from-transparent via-white to-transparent mx-auto" />
//         </motion.div>

//         {/* Main Content */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
//           {/* Left: Personal Statement */}
//           <motion.div
//             initial={{ opacity: 0, x: -50 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.8, delay: 0.2 }}
//             className="space-y-8"
//           >
//             <div className="space-y-6">
//               <p className="text-xl text-gray-300 leading-relaxed font-light">
//                 I'm a passionate Full-Stack AI Engineer pursuing my Master's in Computer Science at
//                 <span className="text-white font-medium"> University of Colorado Boulder</span>.
//               </p>
//               <p className="text-lg text-gray-400 leading-relaxed">
//                 I specialize in building intelligent systems that bridge the gap between cutting-edge AI research and
//                 practical applications, with a focus on creating meaningful impact through technology.
//               </p>
//             </div>

//             {/* CTA Buttons */}
//             <div className="flex gap-4 pt-4">
//               <motion.button
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 className="px-8 py-3 bg-white text-black font-medium hover:bg-gray-100 transition-all duration-300 rounded-sm"
//               >
//                 Download Resume
//               </motion.button>
//               <motion.button
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 onClick={() => scrollToSection("contact")}
//                 className="px-8 py-3 border border-gray-600 text-gray-300 hover:border-white hover:text-white transition-all duration-300 rounded-sm"
//               >
//                 Let's Connect
//               </motion.button>
//             </div>
//           </motion.div>

//           {/* Right: Stats & Highlights */}
//           <motion.div
//             initial={{ opacity: 0, x: 50 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.8, delay: 0.4 }}
//             className="space-y-12"
//           >
//             {/* GitHub Stats Grid */}
//             <div className="grid grid-cols-3 gap-8">
//               <div className="text-center">
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.5 }}
//                   whileInView={{ opacity: 1, scale: 1 }}
//                   transition={{ duration: 0.6, delay: 0.6 }}
//                   className="text-4xl font-light text-white mb-2"
//                 >
//                   {githubStats.loading ? (
//                     <div className="animate-pulse bg-gray-700 h-10 w-16 mx-auto rounded"></div>
//                   ) : (
//                     githubStats.totalRepos
//                   )}
//                 </motion.div>
//                 <div className="text-sm text-gray-500 uppercase tracking-wider">Repositories</div>
//               </div>
//               <div className="text-center">
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.5 }}
//                   whileInView={{ opacity: 1, scale: 1 }}
//                   transition={{ duration: 0.6, delay: 0.7 }}
//                   className="text-4xl font-light text-white mb-2"
//                 >
//                   {githubStats.loading ? (
//                     <div className="animate-pulse bg-gray-700 h-10 w-16 mx-auto rounded"></div>
//                   ) : (
//                     `${githubStats.totalCommits}+`
//                   )}
//                 </motion.div>
//                 <div className="text-sm text-gray-500 uppercase tracking-wider">Commits</div>
//               </div>
//               <div className="text-center">
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.5 }}
//                   whileInView={{ opacity: 1, scale: 1 }}
//                   transition={{ duration: 0.6, delay: 0.8 }}
//                   className="text-4xl font-light text-white mb-2"
//                 >
//                   {githubStats.loading ? (
//                     <div className="animate-pulse bg-gray-700 h-10 w-16 mx-auto rounded"></div>
//                   ) : (
//                     `${Math.floor(githubStats.totalLinesOfCode / 1000)}K`
//                   )}
//                 </motion.div>
//                 <div className="text-sm text-gray-500 uppercase tracking-wider">Lines of Code</div>
//               </div>
//             </div>

//             {/* Key Highlights - Improved Layout */}
//             <div className="space-y-6">
//               {/* Education */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 0.9 }}
//                 className="group"
//               >
//                 <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-900/30 transition-all duration-300">
//                   <div className="w-2 h-2 rounded-full bg-blue-500 mt-3 group-hover:bg-blue-400 transition-colors" />
//                   <div className="flex-1">
//                     <h3 className="text-lg font-medium text-white mb-1 group-hover:text-blue-100 transition-colors">
//                       Education
//                     </h3>
//                     <div className="space-y-1">
//                       <p className="text-gray-300 text-sm">MS Computer Science • University of Colorado Boulder</p>
//                       <p className="text-gray-400 text-sm">BTech IT • DJ Sanghvi College • 8.52 CGPA</p>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Research */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 1.0 }}
//                 className="group"
//               >
//                 <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-900/30 transition-all duration-300">
//                   <div className="w-2 h-2 rounded-full bg-purple-500 mt-3 group-hover:bg-purple-400 transition-colors" />
//                   <div className="flex-1">
//                     <h3 className="text-lg font-medium text-white mb-1 group-hover:text-purple-100 transition-colors">
//                       Research
//                     </h3>
//                     <div className="space-y-1">
//                       <p className="text-gray-300 text-sm">7+ Published Papers • International Journals</p>
//                       <p className="text-gray-400 text-sm">Patent Applied • ML Scheduling Algorithms</p>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Leadership */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 1.1 }}
//                 className="group"
//               >
//                 <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-900/30 transition-all duration-300">
//                   <div className="w-2 h-2 rounded-full bg-green-500 mt-3 group-hover:bg-green-400 transition-colors" />
//                   <div className="flex-1">
//                     <h3 className="text-lg font-medium text-white mb-1 group-hover:text-green-100 transition-colors">
//                       Leadership
//                     </h3>
//                     <div className="space-y-1">
//                       <p className="text-gray-300 text-sm">Vice Chairperson • DJ Init.AI Club</p>
//                       <p className="text-gray-400 text-sm">Research Intern • USC & IIT Patna</p>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             </div>
//           </motion.div>
//         </div>

//         {/* Bottom Accent */}
//         <motion.div
//           initial={{ opacity: 0, scaleX: 0 }}
//           whileInView={{ opacity: 1, scaleX: 1 }}
//           transition={{ duration: 1, delay: 1.2 }}
//           className="mt-20 pt-12 border-t border-gray-800"
//         >
//           <div className="text-center">
//             <p className="text-sm text-gray-500 uppercase tracking-widest">Building the future with AI & Innovation</p>
//           </div>
//         </motion.div>
//       </div>
//     </section>
//   )
// }

// "use client"
// import { motion } from "framer-motion"
// import { useEffect, useState } from "react"
// import { Octokit } from "@octokit/rest"

// interface GitHubStats {
//   totalRepos: number
//   totalCommits: number
//   totalLinesOfCode: number
//   loading: boolean
// }

// interface GraphQLResponse {
//   user: {
//     contributionsCollection: {
//       totalCommitContributions: number
//     }
//   }
// }

// export function AboutSection() {
//   const [githubStats, setGithubStats] = useState<GitHubStats>({
//     totalRepos: 0,
//     totalCommits: 0,
//     totalLinesOfCode: 0,
//     loading: true,
//   })

//   useEffect(() => {
//     const fetchGitHubStats = async () => {
//       try {
//         const octokit = new Octokit({
//           auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN
//         })

//         // Get all public repositories
//         const { data: repos } = await octokit.rest.repos.listForUser({
//           username: 'vedantkesharia',
//           per_page: 100
//         })

//         // Calculate total lines of code (approximation using language stats)
//         let totalLinesOfCode = 0

//         const languagePromises = repos.slice(0, 15).map(async (repo) => {
//           try {
//             const { data: languages } = await octokit.rest.repos.listLanguages({
//               owner: 'vedantkesharia',
//               repo: repo.name
//             })

//             // Sum up bytes of code (rough approximation)
//             return Object.values(languages).reduce((sum: number, bytes) => sum + (bytes as number), 0)
//           } catch (error) {
//             console.log(`Could not fetch languages for ${repo.name}:`, error)
//             return 0
//           }
//         })

//         const languageCounts = await Promise.all(languagePromises)
//         const totalBytes = languageCounts.reduce((sum, count) => sum + count, 0)

//         // Convert bytes to approximate lines (average ~50 characters per line)
//         totalLinesOfCode = Math.floor(totalBytes / 50)

//         // Get total commits using multiple approaches for accuracy
//         let totalCommits = 0

//         try {
//           // Method 1: Get contributions from multiple years (GitHub joined year to current)
//           const currentYear = new Date().getFullYear()
//           const startYear = 2019 // Adjusted to go back further

//           let totalLifetimeCommits = 0

//           for (let year = startYear; year <= currentYear; year++) {
//             try {
//               const contributionsQuery = `
//                 query($username: String!, $from: DateTime!, $to: DateTime!) {
//                   user(login: $username) {
//                     contributionsCollection(from: $from, to: $to) {
//                       totalCommitContributions
//                     }
//                   }
//                 }
//               `

//               const contributionsResult = await octokit.graphql<GraphQLResponse>(contributionsQuery, {
//                 username: 'vedantkesharia',
//                 from: `${year}-01-01T00:00:00Z`,
//                 to: `${year}-12-31T23:59:59Z`
//               })

//               totalLifetimeCommits += contributionsResult.user.contributionsCollection.totalCommitContributions
//             } catch (yearError) {
//               console.log(`Failed to get commits for year ${year}:`, yearError)
//             }
//           }

//           // Method 2: Also try to get total from search API (alternative approach)
//           try {
//             const searchResult = await octokit.rest.search.commits({
//               q: `author:vedantkesharia`,
//               per_page: 1
//             })

//             // The search API gives us total_count which includes ALL commits
//             const searchTotal = searchResult.data.total_count

//             // Use the higher of the two methods
//             totalCommits = Math.max(totalLifetimeCommits, searchTotal)

//             console.log(`GraphQL method: ${totalLifetimeCommits}, Search API: ${searchTotal}`)
//           } catch (searchError) {
//             console.log('Search API failed, using GraphQL result:', searchError)
//             totalCommits = totalLifetimeCommits
//           }
//         } catch (error) {
//           console.log('GraphQL failed, falling back to REST API estimation')

//           // Fallback: Get commits from more repos but with pagination
//           const commitPromises = repos.slice(0, 20).map(async (repo) => {
//             try {
//               // Get first page to check total count
//               const { data: commits } = await octokit.rest.repos.listCommits({
//                 owner: 'vedantkesharia',
//                 repo: repo.name,
//                 author: 'vedantkesharia',
//                 per_page: 1
//               })

//               // Estimate total commits (this is still limited by API)
//               if (commits.length > 0) {
//                 // Try to get a better estimate by checking commit history
//                 const { data: allCommits } = await octokit.rest.repos.listCommits({
//                   owner: 'vedantkesharia',
//                   repo: repo.name,
//                   author: 'vedantkesharia',
//                   per_page: 100
//                 })
//                 return allCommits.length
//               }
//               return 0
//             } catch (error) {
//               console.log(`Could not fetch commits for ${repo.name}:`, error)
//               return 0
//             }
//           })

//           const commitCounts = await Promise.all(commitPromises)
//           totalCommits = commitCounts.reduce((sum, count) => sum + count, 0)

//           // Add estimation multiplier since we're likely undercounting
//           totalCommits = Math.floor(totalCommits * 1.5) // Conservative estimate
//         }

//         setGithubStats({
//           totalRepos: repos.length,
//           totalCommits,
//           totalLinesOfCode,
//           loading: false,
//         })
//       } catch (error) {
//         console.error('Error fetching GitHub stats:', error)
//         // Fallback to mock data if API fails
//         setGithubStats({
//           totalRepos: 42,
//           totalCommits: 1250,
//           totalLinesOfCode: 50000,
//           loading: false,
//         })
//       }
//     }

//     fetchGitHubStats()
//   }, [])

//   const scrollToSection = (sectionId: string) => {
//     document.getElementById(sectionId)?.scrollIntoView({
//       behavior: "smooth",
//       block: "start",
//     })
//   }

//   return (
//     <section id="about" className="py-32 relative overflow-hidden">
//       {/* Subtle background gradient */}
//       <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/50 to-black" />

//       <div className="max-w-6xl mx-auto px-6 relative z-10">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           className="text-center mb-20"
//         >
//           <h2 className="text-6xl font-light mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
//             About
//           </h2>
//           <div className="w-24 h-px bg-gradient-to-r from-transparent via-white to-transparent mx-auto" />
//         </motion.div>

//         {/* Main Content */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
//           {/* Left: Personal Statement */}
//           <motion.div
//             initial={{ opacity: 0, x: -50 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.8, delay: 0.2 }}
//             className="space-y-8"
//           >
//             <div className="space-y-6">
//               <p className="text-xl text-gray-300 leading-relaxed font-light">
//                 I'm a passionate Full-Stack AI Engineer pursuing my Master's in Computer Science at
//                 <span className="text-white font-medium"> University of Colorado Boulder</span>.
//               </p>
//               <p className="text-lg text-gray-400 leading-relaxed">
//                 I specialize in building intelligent systems that bridge the gap between cutting-edge AI research and
//                 practical applications, with a focus on creating meaningful impact through technology.
//               </p>
//             </div>

//             {/* CTA Buttons */}
//             <div className="flex gap-4 pt-4">
//               <motion.button
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 className="px-8 py-3 bg-white text-black font-medium hover:bg-gray-100 transition-all duration-300 rounded-sm"
//               >
//                 Download Resume
//               </motion.button>
//               <motion.button
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 onClick={() => scrollToSection("contact")}
//                 className="px-8 py-3 border border-gray-600 text-gray-300 hover:border-white hover:text-white transition-all duration-300 rounded-sm"
//               >
//                 Let's Connect
//               </motion.button>
//             </div>
//           </motion.div>

//           {/* Right: Stats & Highlights */}
//           <motion.div
//             initial={{ opacity: 0, x: 50 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.8, delay: 0.4 }}
//             className="space-y-12"
//           >
//             {/* GitHub Stats Grid */}
//             <div className="grid grid-cols-3 gap-8">
//               <div className="text-center">
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.5 }}
//                   whileInView={{ opacity: 1, scale: 1 }}
//                   transition={{ duration: 0.6, delay: 0.6 }}
//                   className="text-4xl font-light text-white mb-2"
//                 >
//                   {githubStats.loading ? (
//                     <div className="animate-pulse bg-gray-700 h-10 w-16 mx-auto rounded"></div>
//                   ) : (
//                     githubStats.totalRepos
//                   )}
//                 </motion.div>
//                 <div className="text-sm text-gray-500 uppercase tracking-wider">Repositories</div>
//               </div>
//               <div className="text-center">
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.5 }}
//                   whileInView={{ opacity: 1, scale: 1 }}
//                   transition={{ duration: 0.6, delay: 0.7 }}
//                   className="text-4xl font-light text-white mb-2"
//                 >
//                   {githubStats.loading ? (
//                     <div className="animate-pulse bg-gray-700 h-10 w-16 mx-auto rounded"></div>
//                   ) : (
//                     `${githubStats.totalCommits}+`
//                   )}
//                 </motion.div>
//                 <div className="text-sm text-gray-500 uppercase tracking-wider">Commits</div>
//               </div>
//               <div className="text-center">
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.5 }}
//                   whileInView={{ opacity: 1, scale: 1 }}
//                   transition={{ duration: 0.6, delay: 0.8 }}
//                   className="text-4xl font-light text-white mb-2"
//                 >
//                   {githubStats.loading ? (
//                     <div className="animate-pulse bg-gray-700 h-10 w-16 mx-auto rounded"></div>
//                   ) : (
//                     `${Math.floor(githubStats.totalLinesOfCode / 1000)}K`
//                   )}
//                 </motion.div>
//                 <div className="text-sm text-gray-500 uppercase tracking-wider">Lines of Code</div>
//               </div>
//             </div>

//             {/* Key Highlights - Improved Layout */}
//             <div className="space-y-6">
//               {/* Education */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 0.9 }}
//                 className="group"
//               >
//                 <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-900/30 transition-all duration-300">
//                   <div className="w-2 h-2 rounded-full bg-blue-500 mt-3 group-hover:bg-blue-400 transition-colors" />
//                   <div className="flex-1">
//                     <h3 className="text-lg font-medium text-white mb-1 group-hover:text-blue-100 transition-colors">
//                       Education
//                     </h3>
//                     <div className="space-y-1">
//                       <p className="text-gray-300 text-sm">MS Computer Science • University of Colorado Boulder</p>
//                       <p className="text-gray-400 text-sm">BTech IT • DJ Sanghvi College • 8.52 CGPA</p>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Research */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 1.0 }}
//                 className="group"
//               >
//                 <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-900/30 transition-all duration-300">
//                   <div className="w-2 h-2 rounded-full bg-purple-500 mt-3 group-hover:bg-purple-400 transition-colors" />
//                   <div className="flex-1">
//                     <h3 className="text-lg font-medium text-white mb-1 group-hover:text-purple-100 transition-colors">
//                       Research
//                     </h3>
//                     <div className="space-y-1">
//                       <p className="text-gray-300 text-sm">7+ Published Papers • International Journals</p>
//                       <p className="text-gray-400 text-sm">Patent Applied • ML Scheduling Algorithms</p>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Leadership */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 1.1 }}
//                 className="group"
//               >
//                 <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-900/30 transition-all duration-300">
//                   <div className="w-2 h-2 rounded-full bg-green-500 mt-3 group-hover:bg-green-400 transition-colors" />
//                   <div className="flex-1">
//                     <h3 className="text-lg font-medium text-white mb-1 group-hover:text-green-100 transition-colors">
//                       Leadership
//                     </h3>
//                     <div className="space-y-1">
//                       <p className="text-gray-300 text-sm">Vice Chairperson • DJ Init.AI Club</p>
//                       <p className="text-gray-400 text-sm">Research Intern • USC & IIT Patna</p>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             </div>
//           </motion.div>
//         </div>

//         {/* Bottom Accent */}
//         <motion.div
//           initial={{ opacity: 0, scaleX: 0 }}
//           whileInView={{ opacity: 1, scaleX: 1 }}
//           transition={{ duration: 1, delay: 1.2 }}
//           className="mt-20 pt-12 border-t border-gray-800"
//         >
//           <div className="text-center">
//             <p className="text-sm text-gray-500 uppercase tracking-widest">Building the future with AI & Innovation</p>
//           </div>
//         </motion.div>
//       </div>
//     </section>
//   )
// }

// "use client"
// import { motion } from "framer-motion"
// import { FloatingElements } from "@/components/ui/floating-elements"
// import { AnimatedCounter } from "@/components/ui/animated-counter"
// import { GraduationCap, Award, Code, BookOpen } from "lucide-react"

// export function AboutSection() {
//   const scrollToSection = (sectionId: string) => {
//     document.getElementById(sectionId)?.scrollIntoView({
//       behavior: "smooth",
//       block: "start",
//     })
//   }

//   const stats = [
//     { label: "Research Papers", value: 7, suffix: "+" },
//     { label: "Hackathon Wins", value: 5, suffix: "" },
//     { label: "Years Experience", value: 3, suffix: "+" },
//     { label: "Projects Built", value: 20, suffix: "+" },
//   ]

//   return (
//     <section id="about" className="py-20 relative overflow-hidden">
//       <FloatingElements />
//       <div className="max-w-6xl mx-auto px-6 relative z-10">
//         <div className="grid lg:grid-cols-2 gap-16 items-center">
//           <motion.div
//             initial={{ opacity: 0, x: -50 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.8 }}
//             className="space-y-8"
//           >
//             <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
//               About Me
//             </h2>

//             <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
//               <p>
//                 I'm a passionate Full-Stack AI Engineer pursuing my Master's in Computer Science at University of
//                 Colorado Boulder. I specialize in building intelligent systems that bridge the gap between cutting-edge
//                 AI research and practical applications.
//               </p>
//               <p>
//                 With extensive experience in AI/ML research, full-stack development, and DevOps, I've contributed to
//                 groundbreaking projects at USC, IIT Patna, and leading tech companies. My work spans from digital
//                 phenotyping for mental health to automated document processing systems.
//               </p>
//             </div>

//             {/* Education Section */}
//             <div className="space-y-4">
//               <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
//                 <GraduationCap className="w-6 h-6 mr-3" />
//                 Education
//               </h3>
//               <div className="space-y-3">
//                 <div className="bg-white/5 p-4 rounded-lg border border-gray-800">
//                   <h4 className="text-white font-semibold">Master of Science in Computer Science</h4>
//                   <p className="text-gray-400">University of Colorado Boulder</p>
//                   <p className="text-gray-500 text-sm">Aug 2025 – Apr 2027</p>
//                 </div>
//                 <div className="bg-white/5 p-4 rounded-lg border border-gray-800">
//                   <h4 className="text-white font-semibold">BTech in Information Technology</h4>
//                   <p className="text-gray-400">Dwarkadas J. Sanghvi College of Engineering</p>
//                   <p className="text-gray-500 text-sm">Dec 2021 – May 2025 • CGPA: 8.52/10</p>
//                   <p className="text-gray-500 text-sm">Honors in Development and Operations</p>
//                 </div>
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="flex flex-wrap gap-4 pt-6">
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 className="px-8 py-3 bg-white text-black font-medium hover:bg-gray-200 transition-all duration-300 rounded-lg flex items-center space-x-2"
//               >
//                 <span>Download Resume</span>
//               </motion.button>
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => scrollToSection("contact")}
//                 className="px-8 py-3 border border-white text-white hover:bg-white hover:text-black transition-all duration-300 rounded-lg"
//               >
//                 Let's Connect
//               </motion.button>
//             </div>
//           </motion.div>

//           {/* Stats and Achievements */}
//           <motion.div
//             initial={{ opacity: 0, x: 50 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.8, delay: 0.2 }}
//             className="space-y-8"
//           >
//             {/* Stats Grid */}
//             <div className="grid grid-cols-2 gap-6">
//               {stats.map((stat, index) => (
//                 <motion.div
//                   key={index}
//                   initial={{ opacity: 0, y: 20 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.5, delay: index * 0.1 }}
//                   className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 p-6 rounded-xl border border-gray-700 text-center backdrop-blur-sm"
//                 >
//                   <AnimatedCounter end={stat.value} suffix={stat.suffix} />
//                   <p className="text-gray-400 text-sm mt-2">{stat.label}</p>
//                 </motion.div>
//               ))}
//             </div>

//             {/* Key Achievements */}
//             <div className="bg-gradient-to-br from-gray-900/30 to-gray-800/30 p-8 rounded-xl border border-gray-700 backdrop-blur-sm">
//               <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
//                 <Award className="w-5 h-5 mr-3" />
//                 Key Achievements
//               </h3>
//               <div className="space-y-4">
//                 <div className="flex items-start space-x-3">
//                   <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
//                   <p className="text-gray-300 text-sm">
//                     <span className="text-white font-medium">Smart India Hackathon 2024 Finalist</span> - EcoCarrier ESG
//                     Analytics Platform
//                   </p>
//                 </div>
//                 <div className="flex items-start space-x-3">
//                   <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
//                   <p className="text-gray-300 text-sm">
//                     <span className="text-white font-medium">1st Place IIT Bombay Techfest</span> - CareerMatic RPA
//                     Solution
//                   </p>
//                 </div>
//                 <div className="flex items-start space-x-3">
//                   <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
//                   <p className="text-gray-300 text-sm">
//                     <span className="text-white font-medium">Vice Chairperson</span> - DJ Init.AI Club (70+ members)
//                   </p>
//                 </div>
//                 <div className="flex items-start space-x-3">
//                   <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
//                   <p className="text-gray-300 text-sm">
//                     <span className="text-white font-medium">7+ Research Publications</span> - International Journals &
//                     Conferences
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Specializations */}
//             <div className="grid grid-cols-2 gap-4">
//               <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 p-4 rounded-lg border border-blue-800/30">
//                 <Code className="w-8 h-8 text-blue-400 mb-2" />
//                 <h4 className="text-white font-medium text-sm">Full-Stack Development</h4>
//                 <p className="text-gray-400 text-xs mt-1">MERN, Next.js, Flutter</p>
//               </div>
//               <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 p-4 rounded-lg border border-purple-800/30">
//                 <BookOpen className="w-8 h-8 text-purple-400 mb-2" />
//                 <h4 className="text-white font-medium text-sm">AI/ML Research</h4>
//                 <p className="text-gray-400 text-xs mt-1">NLP, Computer Vision, GANs</p>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </div>
//     </section>
//   )
// }
