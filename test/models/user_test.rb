require "test_helper"

class UserTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  test 'name validation' do
    user = User.new(:email => 'test@test.de')

    assert_not user.valid?
  end
end
