class CreateMatches < ActiveRecord::Migration[7.1]
  def change
    create_table :matches, id: :uuid do |t|
      t.datetime :date, null: false
      t.timestamps
    end
      add_index :matches, :date
  end
end
