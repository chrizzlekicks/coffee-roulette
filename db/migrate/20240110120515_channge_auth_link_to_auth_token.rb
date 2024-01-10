class ChanngeAuthLinkToAuthToken < ActiveRecord::Migration[7.1]
  def change
    rename_column :users, :auth_link, :auth_token
  end
end
