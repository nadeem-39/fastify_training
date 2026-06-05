import axios from "axios";
import { ApiKeySession, ProfilesApi, EventsApi } from "klaviyo-api";
import { env } from "../config/env.js";

export const klaviyo = async (user: any, book: any) => {
  const session = new ApiKeySession(env.KLAVIYO_PRIVATE_KEY);

  const profiles = new ProfilesApi(session);

  let profileId: string;

  try {
    const profile = await profiles.createProfile({
      data: {
        type: "profile",
        attributes: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
    });

    profileId = profile.body.data.id || "";
  } catch (error: any) {
    const duplicateId =
      error?.response?.data?.errors?.[0]?.meta?.duplicate_profile_id;

    if (!duplicateId) {
      console.log(JSON.stringify(error.response?.data, null, 2));
      throw error;
    }

    profileId = duplicateId;
  }

  try {
    await axios.post(
      "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs",
      {
        data: {
          type: "profile-subscription-bulk-create-job",
          attributes: {
            profiles: {
              data: [
                {
                  type: "profile",
                  id: profileId,
                  attributes: {
                    email: user.email, // <-- add this
                    subscriptions: {
                      email: {
                        marketing: {
                          consent: "SUBSCRIBED",
                        },
                      },
                    },
                  },
                },
              ],
            },
          },
          relationships: {
            list: {
              data: {
                type: "list",
                id: env.KLAVIYO_LIST_ID,
              },
            },
          },
        },
      },
      {
        headers: {
          Authorization: `Klaviyo-API-Key ${env.KLAVIYO_PRIVATE_KEY}`,
          Accept: "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
          revision: "2026-04-15",
        },
      },
    );
  } catch (error: any) {
    console.log(
      "Subscribe Error:",
      JSON.stringify(error.response?.data, null, 2),
    );
  }

  try {
    const events = new EventsApi(session);

    await events.createEvent({
      data: {
        type: "event",
        attributes: {
          properties: {
            bookName: book.bookName,
            isbn: book.isbn,
          },
          metric: {
            data: {
              type: "metric",
              attributes: {
                name: "New Book Added",
              },
            },
          },
          profile: {
            data: {
              type: "profile",
              attributes: {
                email: user.email,
              },
            },
          },
        },
      },
    });
  } catch (error: any) {
    console.log("Event Error:", JSON.stringify(error.response?.data, null, 2));
  }
};
