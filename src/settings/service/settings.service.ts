import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DATA_FOUND,
  FAIELD_RESPONSE,
  NO_DATA_FOUND,
  SETTINGS_CREATED_FAILED,
  SETTINGS_CREATED_SUCCESS,
  SETTINGS_UPDATE_SUCCESS,
  SOMETHING_WENT_WRONG,
  SUCCESS_RESPONSE,
} from '../../common/constants';
import { createApiResponse } from '../../common/constants/create-api.response';
import { UpdateSettingsDto } from '../dto/update-settings.dto';
import { Settings } from '../entities/settings.entity';
import { ResourceDeleteService } from 'src/common/module/resource-delete/resource-delete.service';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name)
    private readonly settingsModel: Model<Settings>,
    private readonly resourceDeleteService: ResourceDeleteService,
  ) {}

  /**
   * Updates the application settings, including the web logo, favicon, and app logo.
   *
   * @param createSettingsDto - The DTO containing the updated settings.
   * @param webLogo - The new web logo file.
   * @param favIcon - The new favicon file.
   * @param appLogo - The new app logo file.
   * @returns A success or failure API response with the updated or newly created settings.
   */
  async update(
    createSettingsDto: UpdateSettingsDto,
    webLogo: Express.Multer.File,
    favIcon: Express.Multer.File,
    appLogo: Express.Multer.File,
  ) {
    try {
      const existingSettings = await this.settingsModel.findOne();

      if (existingSettings) {
        // Update existing settings
        if (webLogo) {
          const oldWebLogoPath = existingSettings.webLogo;
          this.deleteFile(oldWebLogoPath);
          existingSettings.webLogo = `uploads/settings-image/${webLogo.filename}`;
        }

        if (favIcon) {
          const oldFavIconPath = existingSettings.favIcon;
          this.deleteFile(oldFavIconPath);
          existingSettings.favIcon = `uploads/settings-image/${favIcon.filename}`;
        }

        if (appLogo) {
          const oldAppLogoPath = existingSettings.appLogo;
          this.deleteFile(oldAppLogoPath);
          existingSettings.appLogo = `uploads/settings-image/${appLogo.filename}`;
        }

        Object.assign(existingSettings, createSettingsDto);
        await existingSettings.save();

        return createApiResponse(
          HttpStatus.OK,
          SUCCESS_RESPONSE,
          SETTINGS_UPDATE_SUCCESS,
          existingSettings,
        );
      } else {
        // Create new settings
        if (webLogo) {
          createSettingsDto.webLogo = `uploads/settings-image/${webLogo.filename}`;
        }

        if (favIcon) {
          createSettingsDto.favIcon = `uploads/settings-image/${favIcon.filename}`;
        }

        if (appLogo) {
          createSettingsDto.appLogo = `uploads/settings-image/${appLogo.filename}`;
        }

        const createSettings = new this.settingsModel(createSettingsDto);
        await createSettings.save();

        return createApiResponse(
          HttpStatus.CREATED,
          SUCCESS_RESPONSE,
          SETTINGS_CREATED_SUCCESS,
          createSettings,
        );
      }
    } catch (err) {
      // Delete uploaded files in case of error
      if (webLogo) {
        const path = `uploads/settings-image/${webLogo.filename}`;
        this.deleteFile(path);
      }

      if (favIcon) {
        const path = `uploads/settings-image/${favIcon.filename}`;
        this.deleteFile(path);
      }

      if (appLogo) {
        const path = `uploads/settings-image/${appLogo.filename}`;
        this.deleteFile(path);
      }

      return createApiResponse(
        HttpStatus.EXPECTATION_FAILED,
        FAIELD_RESPONSE,
        SETTINGS_CREATED_FAILED,
        err.message,
      );
    }
  }
  /**
   * Deletes a file at the specified path.
   * @param path - The path of the file to delete.
   * @returns A promise that resolves when the file is deleted.
   * @throws An error if the file could not be deleted.
   */
  private async deleteFile(path: string): Promise<void> {
    try {
      await this.resourceDeleteService.delete(path);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Retrieves the settings from the database.
   * @returns A promise that resolves with the settings data, or a 404 response if no settings data is found.
   * @throws An error if there was a problem retrieving the settings data.
   */
  async getSettings(): Promise<any> {
    try {
      const data = await this.settingsModel.findOne();
      if (data) {
        return createApiResponse(
          HttpStatus.OK,
          SUCCESS_RESPONSE,
          DATA_FOUND,
          data,
        );
      } else {
        return createApiResponse(
          HttpStatus.NOT_FOUND,
          SUCCESS_RESPONSE,
          NO_DATA_FOUND,
        );
      }
    } catch (error) {
      return createApiResponse(
        HttpStatus.BAD_REQUEST,
        FAIELD_RESPONSE,
        SOMETHING_WENT_WRONG,
        error,
      );
    }
  }
}
