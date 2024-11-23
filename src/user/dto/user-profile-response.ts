export class UserProfileResponse {
  constructor(username: string, profileImg?: string, bgImg?: string) {
    this.username = username;
    this.profileImg = profileImg;
    this.bgImg = bgImg;
  }
  username: string;
  profileImg: string | undefined;
  bgImg: string | undefined;
}
