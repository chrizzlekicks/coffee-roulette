require "test_helper"

class UserMatchTest < ActiveSupport::TestCase
  setup do
    @match = Match.create!(DateTime.now)
  end
end
