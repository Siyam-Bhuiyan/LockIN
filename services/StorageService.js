//path=services/StorageService.js
import AsyncStorage from "@react-native-async-storage/async-storage";

class StorageService {
  // Projects
  async getProjects() {
    try {
      const data = await AsyncStorage.getItem("projects");
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting projects:", error);
      return [];
    }
  }

  async saveProjects(projects) {
    try {
      await AsyncStorage.setItem("projects", JSON.stringify(projects));
    } catch (error) {
      console.error("Error saving projects:", error);
    }
  }

  // Learning/Videos
  async getVideos() {
    try {
      const data = await AsyncStorage.getItem("videos");
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting videos:", error);
      return [];
    }
  }

  async saveVideos(videos) {
    try {
      await AsyncStorage.setItem("videos", JSON.stringify(videos));
    } catch (error) {
      console.error("Error saving videos:", error);
    }
  }

  // Roadmaps
  async getRoadmaps() {
    try {
      const data = await AsyncStorage.getItem("roadmaps");
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting roadmaps:", error);
      return [];
    }
  }

  async saveRoadmaps(roadmaps) {
    try {
      await AsyncStorage.setItem("roadmaps", JSON.stringify(roadmaps));
    } catch (error) {
      console.error("Error saving roadmaps:", error);
    }
  }

  // CP Problems
  async getProblems() {
    try {
      const data = await AsyncStorage.getItem("problems");
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting problems:", error);
      return [];
    }
  }

  async saveProblems(problems) {
    try {
      await AsyncStorage.setItem("problems", JSON.stringify(problems));
    } catch (error) {
      console.error("Error saving problems:", error);
    }
  }

  // NeetCode Progress
  async getNeetCodeProgress() {
    try {
      const data = await AsyncStorage.getItem("neetCodeProgress");
      return data
        ? JSON.parse(data)
        : {
            solved: 0,
            total: 150,
            easy: { solved: 0, total: 61 },
            medium: { solved: 0, total: 76 },
            hard: { solved: 0, total: 13 },
            lastSolved: null,
            problems: [],
          };
    } catch (error) {
      console.error("Error getting NeetCode progress:", error);
      return {
        solved: 0,
        total: 150,
        easy: { solved: 0, total: 61 },
        medium: { solved: 0, total: 76 },
        hard: { solved: 0, total: 13 },
        lastSolved: null,
        problems: [],
      };
    }
  }

  async saveNeetCodeProgress(progress) {
    try {
      await AsyncStorage.setItem("neetCodeProgress", JSON.stringify(progress));
    } catch (error) {
      console.error("Error saving NeetCode progress:", error);
    }
  }

  // Generic storage methods for other features
  async getItem(key) {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  }

  async setItem(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
    }
  }

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  }

  // Export/Import
  async exportData() {
    try {
      const projects = await this.getProjects();
      const videos = await this.getVideos();
      const roadmaps = await this.getRoadmaps();
      const problems = await this.getProblems();
      const neetCodeProgress = await this.getNeetCodeProgress();

      return {
        projects,
        videos,
        roadmaps,
        problems,
        neetCodeProgress,
        exportDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error exporting data:", error);
      return null;
    }
  }

  async importData(data) {
    try {
      if (data.projects) await this.saveProjects(data.projects);
      if (data.videos) await this.saveVideos(data.videos);
      if (data.roadmaps) await this.saveRoadmaps(data.roadmaps);
      if (data.problems) await this.saveProblems(data.problems);
      if (data.neetCodeProgress)
        await this.saveNeetCodeProgress(data.neetCodeProgress);
      return true;
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  }
}

export default new StorageService();
